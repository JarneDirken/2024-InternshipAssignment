import prisma from "@/services/db";
import { db } from "@/services/firebase-config";
import admin from '@/services/firebase-admin-config';
import { addDoc, collection } from "firebase/firestore";
import { NextRequest } from "next/server";

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
                    active: false,
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

            if (!user) {
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

export async function DELETE(req: NextRequest) {
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
            const userForDeletion = await prisma.user.findUnique({
                where: {
                    id: data.id,
                },
            });

            if (userForDeletion) {
                try {
                    await admin.auth().deleteUser(userForDeletion.firebaseUid);
                } catch (error) {
                    if (error instanceof Error) {
                        console.error(`Error deleting user from Firebase: ${error.message}`);
                    } else {
                        console.error('Error deleting user from Firebase:', error);
                    }
                    throw new Error('Failed to delete user from Firebase Auth');
                }
    
                const deleteUser = await prisma.user.delete({
                    where: {
                        id: data.id,
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

                if (!user) {
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
                            message: `User: ${deleteUser.firstName} ${deleteUser.lastName} has been deleted by ${user?.firstName} ${user?.lastName}`,
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
    
                return { deleteUser };
            }
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