import prisma from "@/services/db";
import { db } from "@/services/firebase-config";
import { Prisma } from "@prisma/client";
import { addDoc, collection } from "firebase/firestore";
import { NextRequest } from "next/server";
interface WhereClause extends Prisma.ItemWhereInput {}

interface OrderByType {
    [key: string]: Prisma.SortOrder | OrderByRecursiveType;
}

interface OrderByRecursiveType extends Record<string, Prisma.SortOrder | OrderByType> {}

function createNestedOrderBy(sortBy: string, sortDirection: Prisma.SortOrder): OrderByType {
    const fields = sortBy.split('.');
    let currentOrderBy: OrderByType = {};
    let lastOrderBy = currentOrderBy;

    fields.forEach((field, index) => {
        if (index === fields.length - 1) {
            lastOrderBy[field] = sortDirection;  // Set the final sort direction
        } else {
            lastOrderBy[field] = {};  // Create a nested object
            lastOrderBy = lastOrderBy[field] as OrderByType;  // Move deeper into the object
        }
    });

    return currentOrderBy;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const nameFilter = searchParams.get('name') || '';
    const modelFilter = searchParams.get('model') || '';
    const brandFilter = searchParams.get('brand') || '';
    const locationFilter = searchParams.get('location') || '';
    const yearBoughtFilter = searchParams.get('year') || '';
    const availabilityFilter = searchParams.get('availability') || '';
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortDirection = searchParams.get('sortDirection') as Prisma.SortOrder || 'desc';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    const orderBy = createNestedOrderBy(sortBy, sortDirection);

    const user = await prisma.user.findUnique({
        where: {
            firebaseUid: uid,
        },
        include: {
            role: true,
        }
    });

    if (!user){
        return new Response(JSON.stringify("User not found"), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    if (!["Admin"].includes(user.role.name)) {
        return new Response(JSON.stringify("Forbidden, you don't have the rights to make this call"), {
            status: 403, // Use 403 for Forbidden instead of 404
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const availabilityOptions = availabilityFilter.split(', ').filter(Boolean);
    let activeCondition;

    if (availabilityOptions.length === 2) {
        // If both 'Active' and 'Inactive' are selected, do not filter by active status.
        activeCondition = undefined;
    } else if (availabilityOptions.includes('Active') && !availabilityOptions.includes('Inactive')) {
        // If only 'Active' is selected
        activeCondition = true;
    } else if (availabilityOptions.includes('Inactive') && !availabilityOptions.includes('Active')) {
        // If only 'Inactive' is selected
        activeCondition = false;
    }

    const whereClause: WhereClause = {
        name: { contains: nameFilter, mode: 'insensitive' },
        model: { contains: modelFilter, mode: 'insensitive' },
        brand: { contains: brandFilter, mode: 'insensitive' },
        location: { 
            name: {contains: locationFilter, mode: 'insensitive'}
        },
        ...(yearBoughtFilter && {
            yearBought: {
                gte: new Date(`${yearBoughtFilter}-01-01T00:00:00.000Z`),
                lte: new Date(`${yearBoughtFilter}-12-31T23:59:59.999Z`)
            }
        }),
        ...(activeCondition !== undefined && { active: { equals: activeCondition } })
    };

    const items = await prisma.item.findMany({
        where: whereClause,
        include: { 
            RoleItem: true,
            location: true,
            itemStatus: true,
        },
        orderBy: orderBy,
        skip: offset, // infinate scroll
        take: limit // infinate scroll
    });

    const itemsAll = await prisma.item.findMany({
        where: whereClause,
        include: { 
            RoleItem: true,
            location: true,
            itemStatus: true,
        },
        orderBy: orderBy,
    });

    const roles = await prisma.role.findMany();

    const locations = await prisma.location.findMany();

    const itemStatuses = await prisma.itemStatus.findMany();

    return new Response(JSON.stringify({items, roles, locations, itemStatuses, itemsAll}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function POST(req: NextRequest) {
    const { data } = await req.json();

        // Check if the item already has an active request with itemStatusId: 3
        const result = await prisma.$transaction(async (prisma) => {
            const createProduct = await prisma.item.create({
                data: {
                    locationId: data.locationId,
                    itemStatusId: data.itemStatusId,
                    yearBought: data.yearBought,
                    active: data.active,
                    brand: data.brand,
                    model: data.model,
                    name: data.name,
                    notes: data.notes,
                    number: data.number,
                    schoolNumber: data.schoolNumber,
                    image: data.image,
                    consumable: data.consumable,
                    amount: data.amount,
                },
            });
    
            const createRoleItem = await prisma.roleItem.create({
                data: {
                    roleId: data.roleId,
                    itemId: createProduct.id,
                },
            });

            const user = await prisma.user.findUnique({
                where: {
                    firebaseUid: data.userId,
                },
                include: {
                    role: true,
                }
            });
    
            const Admin = await prisma.user.findMany({
                where: {
                    role: { name: "Admin" }
                },
            });
    
            try {
                await Promise.all(Admin.map(admin => {
                    const notification = {
                        isRead: true,
                        fromRole: user?.role.name,
                        toRole: ["Admin"],
                        message: `New product: ${createProduct.name} has been created from ${user?.firstName} ${user?.lastName}`,
                        timeStamp: new Date(),
                        userId: data.userId,
                        targets: ["Admin"]
                    };
    
                    // Add the notification to the 'notifications' collection in Firestore
                    return addDoc(collection(db, "notifications"), notification);
                }));
            } catch (error) {
                console.error('Error sending notifications:', error);
            }

            return { createProduct, createRoleItem };
        });

    // If the Prisma transaction was successful, send notifications
    if (result) {
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };
}


export async function PUT(req: NextRequest) {
    const { data } = await req.json();

        // Check if the item already has an active request with itemStatusId: 3
        const result = await prisma.$transaction(async (prisma) => {
            const updateProduct = await prisma.item.update({
                where: {
                    id: data.id,
                },
                data: {
                    locationId: data.locationId,
                    itemStatusId: data.itemStatusId,
                    yearBought: data.yearBought,
                    active: data.active,
                    brand: data.brand,
                    model: data.model,
                    name: data.name,
                    notes: data.notes,
                    number: data.number,
                    schoolNumber: data.schoolNumber,
                    image: data.image,
                    consumable: data.consumable,
                    amount: data.amount,
                },
            });

            const updateRoleItem = await prisma.roleItem.update({
                where: {
                    id: data.roleItemId,
                },
                data: {
                    roleId: data.roleId,
                    itemId: updateProduct.id,
                },
            });

            const user = await prisma.user.findUnique({
                where: {
                    firebaseUid: data.userId,
                },
                include: {
                    role: true,
                }
            });
    
            const Admin = await prisma.user.findMany({
                where: {
                    role: { name: "Admin" }
                },
            });
    
            try {
                await Promise.all(Admin.map(admin => {
                    const notification = {
                        isRead: true,
                        fromRole: user?.role.name,
                        toRole: ["Admin"],
                        message: `Product: ${updateProduct.name} has been updated by ${user?.firstName} ${user?.lastName}`,
                        timeStamp: new Date(),
                        userId: data.userId,
                        targets: ["Admin"]
                    };
    
                    // Add the notification to the 'notifications' collection in Firestore
                    return addDoc(collection(db, "notifications"), notification);
                }));
            } catch (error) {
                console.error('Error sending notifications:', error);
            }

            return { updateProduct, updateRoleItem };
        });

    // If the Prisma transaction was successful, send notifications
    if (result) {
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };
}