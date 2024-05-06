import prisma from "@/services/db";
import { db } from "@/services/firebase-config";
import { addDoc, collection } from "firebase/firestore";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
    const { data } = await req.json();

        // Check if the item already has an active request with itemStatusId: 3
        const result = await prisma.$transaction(async (prisma) => { 
            const deleteLocation = await prisma.location.delete({
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
                        message: `Location: ${deleteLocation.name} has been deleted by ${user?.firstName} ${user?.lastName}`,
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

            return deleteLocation;
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