import prisma from "@/services/db";
import { db } from "@/services/firebase-config";
import { Prisma } from "@prisma/client";
import { addDoc, collection } from "firebase/firestore";
import { NextRequest } from "next/server";
import admin from '@/services/firebase-admin-config';

interface WhereClause extends Prisma.UserWhereInput {}

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
    const firstNameFilter = searchParams.get('firstName') || '';
    const lastNameFilter = searchParams.get('lastName') || '';
    const emailFilter = searchParams.get('email') || '';
    const roleFilter = searchParams.get('role') || '';
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortDirection = searchParams.get('sortDirection') as Prisma.SortOrder || 'desc';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const token = searchParams.get("token") || '';

    const orderBy = createNestedOrderBy(sortBy, sortDirection);

    const user = await prisma.user.findUnique({
        where: {
            firebaseUid: uid,
        },
        include: {
            role: true,
        }
    });

    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken) {
        return new Response(JSON.stringify("Unauthorized"), {
            status: 403,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

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

    const whereClause: WhereClause = {
        firstName: { contains: firstNameFilter, mode: 'insensitive' },
        lastName: { contains: lastNameFilter, mode: 'insensitive' },
        email: { contains: emailFilter, mode: 'insensitive' },
        role: { 
            name: {contains: roleFilter, mode: 'insensitive'}
        },
    };

    const users = await prisma.user.findMany({
        where: whereClause,
        include: { 
            role: true,
        },
        orderBy: orderBy,
        skip: offset, // infinite scroll
        take: limit // infinite scroll
    });

    const usersAll = await prisma.user.findMany({
        where: whereClause,
        include: { 
            role: true,
        },
        orderBy: orderBy,
    });

    const roles = await prisma.role.findMany();

    return new Response(JSON.stringify({users, usersAll, roles}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function POST(req: NextRequest) {
    const { data } = await req.json();

    const decodedToken = await admin.auth().verifyIdToken(data.token);

    if (!decodedToken) {
        return new Response(JSON.stringify("Unauthorized"), {
            status: 403,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

        // Check if the item already has an active request with itemStatusId: 3
        const result = await prisma.$transaction(async (prisma) => {
            const userRecord = await admin.auth().createUser({
                email: data.email,
                password: "Kmitl2024!",
                displayName: `${data.firstName} ${data.lastName}`,
                disabled: !data.active,
            });
    

            const createUser = await prisma.user.create({
                data: {
                    firebaseUid: userRecord.uid,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    studentCode: data.studentCode,
                    tel: data.tel,
                    email: data.email,
                    roleId: data.roleId,
                    active: data.active,
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
                        message: `New user: ${createUser.firstName} ${createUser.lastName} has been created from ${user?.firstName} ${user?.lastName}`,
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

            return { createUser };
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

    const decodedToken = await admin.auth().verifyIdToken(data.token);

    if (!decodedToken) {
        return new Response(JSON.stringify("Unauthorized"), {
            status: 403,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

        // Check if the item already has an active request with itemStatusId: 3
        const result = await prisma.$transaction(async (prisma) => {
            const updateUser = await prisma.user.update({
                where: {
                    id: data.id,
                },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    studentCode: data.studentCode,
                    tel: data.tel,
                    email: data.email,
                    roleId: data.roleId,
                    active: data.active,
                },
            });

            await admin.auth().updateUser(updateUser.firebaseUid, {
                email: data.email,
                displayName: `${data.firstName} ${data.lastName}`,
                disabled: !data.active,
            })

            const user = await prisma.user.findUnique({
                where: {
                    firebaseUid: data.userId,
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
                        message: `User: ${updateUser.firstName} ${updateUser.lastName} has been updated by ${user?.firstName} ${user?.lastName}`,
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

            return { updateUser };
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