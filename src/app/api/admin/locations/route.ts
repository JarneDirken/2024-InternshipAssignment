import prisma from "@/services/db";
import { db } from "@/services/firebase-config";
import { Prisma } from "@prisma/client";
import { addDoc, collection } from "firebase/firestore";
import { NextRequest } from "next/server";
interface WhereClause extends Prisma.LocationWhereInput {}

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
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortDirection = searchParams.get('sortDirection') as Prisma.SortOrder || 'desc';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    const orderBy = createNestedOrderBy(sortBy, sortDirection);

    const user = await prisma.user.findUnique({
        where: {
            firebaseUid: uid,
        },
    });

    if (!user){
        return new Response(JSON.stringify("User not found"), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const whereClause: WhereClause = {
        name: { contains: nameFilter, mode: 'insensitive' },
    };

    const locations = await prisma.location.findMany({
        where: whereClause,
        include: { 
            Items: true
        },
        orderBy: orderBy, 
        skip: offset, // infinite scroll
        take: limit // infinite scroll
    });

    const locationsAll = await prisma.location.findMany({
        where: whereClause,
        orderBy: orderBy,
    });

    return new Response(JSON.stringify({locations, locationsAll}), {
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
            const createLocation = await prisma.location.create({
                data: {
                    name: data.name,
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
                        message: `New location: ${createLocation.name} has been created from ${user?.firstName} ${user?.lastName}`,
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

            return createLocation;
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
            const updateLocation = await prisma.location.update({
                where: {
                    id: data.id,
                },
                data: {
                    name: data.name,
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
                        message: `Location: ${updateLocation.name} has been updated by ${user?.firstName} ${user?.lastName}`,
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

            return updateLocation;
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