import prisma from "@/services/db";
import admin from "@/services/firebase-admin-config";
import { db } from "@/services/firebase-config";
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

    const result = await prisma.$transaction(async (prisma) => {
        const products = await prisma.item.findMany({
            where: {
                id: {
                    in: data.ids,
                },
            },
        });

        const updatedProducts = await prisma.item.updateMany({
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
        await Promise.all(products.map(async (product) => {
            return Promise.all(Admins.map(admin => {
                const notification = {
                    isRead: true,
                    fromRole: user?.role.name,
                    toRole: ["Admin"],
                    message: `Product: ${product.name}, with ID: ${product.id} has been soft deleted by ${user?.firstName} ${user?.lastName}`,
                    timeStamp: new Date(),
                    userId: data.userId,
                    targets: ["Admin"]
                };

                return addDoc(collection(db, "notifications"), notification);
            }));
        }));

        return updatedProducts;
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

    const decodedToken = await admin.auth().verifyIdToken(data.token);

    if (!decodedToken) {
        return new Response(JSON.stringify("Unauthorized"), {
            status: 403,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const result = await prisma.$transaction(async (prisma) => {
        const products = await prisma.item.findMany({
            where: {
                id: {
                    in: data.ids,
                },
            },
        });

        await prisma.roleItem.deleteMany({
            where: {
                itemId: {
                    in: data.ids,
                },
            },
        });

        const deletedProducts = await prisma.item.deleteMany({
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

        // Notify each Admin about the permanent deletion
        await Promise.all(products.map(async (product) => {
            return Promise.all(Admins.map(admin => {
                const notification = {
                    isRead: true,
                    fromRole: user?.role.name,
                    toRole: ["Admin"],
                    message: `Product: ${product.name}, with ID: ${product.id} has been permanently deleted by ${user?.firstName} ${user?.lastName}`,
                    timeStamp: new Date(),
                    userId: data.userId,
                    targets: ["Admin"]
                };

                return addDoc(collection(db, "notifications"), notification);
            }));
        }));

        return deletedProducts;
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