import prisma from '@/services/db';
import admin from '@/services/firebase-admin-config';
import { db } from '@/services/firebase-config';
import { collection, addDoc } from "firebase/firestore"; 
import { NextRequest } from 'next/server';

export async function GET() {
    const parameters = await prisma.parameter.findMany();

    return new Response(JSON.stringify(parameters), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

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

    const results = await prisma.$transaction([
        prisma.parameter.updateMany({
            where: { name: 'morningStartTime' },
            data: { value: data.morningStartTime },
        }),
        prisma.parameter.updateMany({
            where: { name: 'morningEndTime' },
            data: { value: data.morningEndTime },
        }),
        prisma.parameter.updateMany({
            where: { name: 'eveningStartTime' },
            data: { value: data.eveningStartTime },
        }),
        prisma.parameter.updateMany({
            where: { name: 'eveningEndTime' },
            data: { value: data.eveningEndTime },
        }),
        prisma.parameter.updateMany({
            where: { name: 'morningBufferTime' },
            data: { value: data.morningBufferTime },
        }),
        prisma.parameter.updateMany({
            where: { name: 'eveningBufferTime' },
            data: { value: data.eveningBufferTime },
        }),
    ]);

    if (results) {
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

        const admins = await prisma.user.findMany({
            where: {
                role: { name: "Admin" }
            },
        });

        try {
            await Promise.all(admins.map(admin => {
                // Directly create the notification object as intended to store in Firestore
                const notification = {
                    isRead: true,
                    fromRole: user?.role.name,
                    toRole: ["Admin"],
                    message: `Parameters updated by: ${user?.firstName} ${user?.lastName}`,
                    timeStamp: new Date(),
                };

                // Add the notification to the 'notifications' collection in Firestore
                return addDoc(collection(db, "notifications"), notification);
            }));
        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    }

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};