import prisma from '@/services/db';
import { NextApiRequest } from 'next';
import { db } from '@/services/firebase-config';
import { collection, addDoc, where, query, getDocs, updateDoc, doc } from "firebase/firestore"; 

export async function DELETE(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    const result = await prisma.$transaction(async (prisma) => {
        const deleteItemRequest = await prisma.itemRequest.delete({
            where: {
                id: data.requestId
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
