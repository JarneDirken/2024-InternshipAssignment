import prisma from "@/services/db";
import { db } from "@/services/firebase-config";
import admin from '@/services/firebase-admin-config';
import { addDoc, collection } from "firebase/firestore";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
    const { data } = await req.json();

    const result = await prisma.$transaction(async (prisma) => {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: data.ids,
                },
            },
        });

        const updatedUsers = await prisma.user.updateMany({
            where: {
                id: {
                    in: data.ids,
                },
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

        const Admins = await prisma.user.findMany({
            where: {
                role: { name: "Admin" }
            },
        });

        // Notify each Admin about the soft deletion
        await Promise.all(users.map(async (item) => {
            return Promise.all(Admins.map(admin => {
                const notification = {
                    isRead: true,
                    fromRole: user?.role.name,
                    toRole: ["Admin"],
                    message: `User: ${item.firstName} ${item.lastName}, with ID: ${item.id} has been soft deleted by ${user?.firstName} ${user?.lastName}`,
                    timeStamp: new Date(),
                    userId: data.userId,
                    targets: ["Admin"]
                };

                return addDoc(collection(db, "notifications"), notification);
            }));
        }));

        return updatedUsers;
    });

    if (result) {
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export async function DELETE(req: NextRequest) {
    const { data } = await req.json();

    const result = await prisma.$transaction(async (prisma) => {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: data.ids,
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                firebaseUid: true,
            }
        });

        await Promise.all(users.map(user => {
            return admin.auth().deleteUser(user.firebaseUid)
                .catch(error => {
                    console.error(`Failed to delete user ${user.id} from Firebase:`, error);
                    // Optionally throw an error to stop the database deletion if Firebase deletion fails
                    throw new Error(`Failed to delete user ${user.id} from Firebase`);
                });
        }));

        const deletedUsers = await prisma.user.deleteMany({
            where: {
                id: {
                    in: data.ids,
                },
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

        const Admins = await prisma.user.findMany({
            where: {
                role: { name: "Admin" }
            },
        });

        // Notify each Admin about the permanent deletion
        await Promise.all(users.map(async (item) => {
            return Promise.all(Admins.map(admin => {
                const notification = {
                    isRead: true,
                    fromRole: user?.role.name,
                    toRole: ["Admin"],
                    message: `User: ${item.firstName} ${item.lastName}, with ID: ${item.id} has been permanently deleted by ${user?.firstName} ${user?.lastName}`,
                    timeStamp: new Date(),
                    userId: data.userId,
                    targets: ["Admin"]
                };

                return addDoc(collection(db, "notifications"), notification);
            }));
        }));

        return deletedUsers;
    });

    if (result) {
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}