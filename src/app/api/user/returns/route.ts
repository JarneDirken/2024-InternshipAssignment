import prisma from '@/services/db';
import { Prisma } from '@prisma/client';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';
import { db } from '@/services/firebase-config';
import { collection, addDoc, query, where, getDocs, updateDoc } from "firebase/firestore"; 
interface WhereClause extends Prisma.ItemRequestWhereInput {}

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
    const borrowDate = searchParams.get('borrowDate');
    const returnDate = searchParams.get('returnDate');
    const sortBy = searchParams.get('sortBy') || 'returnDate';  // Default sort field
    const sortDirection = searchParams.get('sortDirection') as Prisma.SortOrder || 'desc';  // Default sort direction

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
        borrowerId: uid,
        item: {
            name: { contains: nameFilter, mode: 'insensitive' },
            itemStatusId: { in: [3, 4] },
        },
        requestStatusId: { in: [4, 5] },
    };
    
    if (borrowDate) {
        const borrowDateStart = new Date(borrowDate);
        borrowDateStart.setHours(0, 0, 0, 0);  // Set to start of the day
        whereClause.borrowDate = {
            gte: borrowDateStart
        };
    }
    
    if (returnDate) {
        const returnDateEnd = new Date(returnDate);
        returnDateEnd.setHours(23, 59, 59, 999);  // Set to end of the day
        whereClause.returnDate = {
            lte: returnDateEnd
        };
    }
    
    const itemRequests = await prisma.itemRequest.findMany({
        where: whereClause,
        include: {
            item: {
                include: {
                    location: true,
                },
            },
        },
        orderBy: orderBy, 
    });
    
    const totalCount = await prisma.itemRequest.count({
        where: whereClause,
    });

    return new Response(JSON.stringify({ itemRequests, totalCount }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PUT(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    const result = await prisma.$transaction(async (prisma) => {
        const updateItemRequest = await prisma.itemRequest.update({
            where: {
                id: data.requestId,
            },
            data: {
                requestStatusId: 5
            },
        });

        const updateItem = await prisma.item.update({
            where: {
                id: data.itemId,
            },
            data: {
                itemStatusId: 4,
            }
        });

        return {updateItemRequest, updateItem};
    });

    // If the Prisma transaction was successful, send notifications
    if (result) {
        const user = await prisma.user.findUnique({
            where: {
                firebaseUid: data.userId,
            },
            include: {
                role: true,
            }
        });

        const item = await prisma.item.findUnique({
            where: {
                id: data.itemId
            }
        });

        // Mark previous notifications related to this request as read
        const notificationsRef = collection(db, "notifications");
        const q = query(notificationsRef, where("requestId", "==", data.requestId), where("isRead", "==", false));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, { isRead: true });
        });

        const supervisorsAndAdmins = await prisma.user.findMany({
            where: {
                OR: [
                    { role: { name: "Supervisor" } },
                    { role: { name: "Admin" } }
                ],
            },
        });

        try {
            await Promise.all(supervisorsAndAdmins.map(supervisor => {
                const notification = {
                    isRead: false,
                    fromRole: user?.role.name,
                    toRole: ["Supervisor", "Admin"],
                    message: `User ${user?.firstName} ${user?.lastName} returned: ${item?.name}`,
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
};