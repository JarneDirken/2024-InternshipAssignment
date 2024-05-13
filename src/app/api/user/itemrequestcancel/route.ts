import prisma from '@/services/db';
import { db } from '@/services/firebase-config';
import { collection, addDoc, where, query, getDocs, updateDoc, doc } from "firebase/firestore"; 
import { NextRequest } from 'next/server';

export async function PUT(req: NextRequest) {
    const { data } = await req.json();

    const result = await prisma.$transaction(async (prisma) => {
        const deleteItemRequest = await prisma.itemRequest.update({
            where: {
                id: data.requestId
            },
            data: {
                requestStatusId: 8,
            }
        });

        const updateItem = await prisma.item.update({
            where: {
                id: data.itemId,
            },
            data: {
                itemStatusId: 1
            },
        });

        return {deleteItemRequest, updateItem};
    });

    // If the Prisma transaction was successful, send notifications
    if (result) {
        const user = await prisma.user.findUnique({
            where: {
                firebaseUid: data.borrowerId,
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
    
        if (!["Admin", "Supervisor", "Teacher", "Student"].includes(user.role.name)) {
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

        const notificationsRef = collection(db, "notifications");
        const q = query(notificationsRef, where("requestId", "==", data.requestId));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnapshot) => {
            updateDoc(doc(db, "notifications", docSnapshot.id), {
                isRead: true
            });
        });

        try {
            await Promise.all(admins.map(admin => {
                // Directly create the notification object as intended to store in Firestore
                const notification = {
                    isRead: true,
                    fromRole: user?.role.name,
                    toRole: ["Admin"],
                    message: `Borrow request cancelled from ${user?.firstName} ${user?.lastName}`,
                    timeStamp: new Date(),
                    requestId: data.requestId,
                };

                // Add the notification to the 'notifications' collection in Firestore
                return addDoc(collection(db, "notifications"), notification);
            }));
        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    };

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
