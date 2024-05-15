import prisma from "@/services/db";
import admin from "@/services/firebase-admin-config";
import { db } from "@/services/firebase-config";
import { Prisma } from "@prisma/client";
import { addDoc, collection, getDocs, query, updateDoc, where } from "firebase/firestore";
import { NextRequest } from "next/server";
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
    const locationFilter = searchParams.get('location') || '';
    const requestorFilter = searchParams.get('requestor') || '';
    const sortBy = searchParams.get('sortBy') || 'requestDate';  // Default sort field
    const sortDirection = searchParams.get('sortDirection') as Prisma.SortOrder || 'desc';  // Default sort direction
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

    if (!["Admin", "Supervisor"].includes(user.role.name)) {
        return new Response(JSON.stringify("Forbidden, you don't have the rights to make this call"), {
            status: 403, // Use 403 for Forbidden instead of 404
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const baseWhereClause: WhereClause = {
        item: {
            name: { contains: nameFilter, mode: 'insensitive' },
            location: { 
                name: { contains: locationFilter, mode: 'insensitive' }
            },
        },
        borrower: { 
            firstName: { contains: requestorFilter, mode: 'insensitive' }
        },
    };

    // Set dynamic parts based on specific needs
    const dynamicWhereClauses = [2, 5, 6].map(statusId => ({
        ...baseWhereClause,
        requestStatusId: statusId
    }));
    
   // Handle date filters
   const handleDateFilter = (whereClause: WhereClause) => {
        if (borrowDate) {
            const borrowDateStart = new Date(borrowDate);
            borrowDateStart.setHours(0, 0, 0, 0);
            whereClause.borrowDate = {
                gte: borrowDateStart
            };
        }
        if (returnDate) {
            const returnDateEnd = new Date(returnDate);
            returnDateEnd.setHours(23, 59, 59, 999);
            whereClause.returnDate = {
                lte: returnDateEnd
            };
        }
    };

    // Apply date filters to each where clause
    dynamicWhereClauses.forEach(handleDateFilter);

    // Fetch and count requests
    const itemRequests = await prisma.itemRequest.findMany({
        where: dynamicWhereClauses[0],
        include: { 
            item: {
                include: {
                    location: true
                }
            },
            borrower: true,
            approver: true,
        },
        orderBy: orderBy,
        skip: offset, // infinate scroll
        take: limit // infinate scroll
    });

    const totalCounts = await Promise.all(dynamicWhereClauses.map(clause =>
        prisma.itemRequest.count({ where: clause })
    ));

    const allitemRequests = await prisma.itemRequest.findMany({
        where: dynamicWhereClauses[0],
        include: { 
            item: {
                include: {
                    location: true
                }
            },
            borrower: true,
            approver: true,
        },
    });

    return new Response(JSON.stringify({
        itemRequests,
        totalCount: totalCounts[0],
        totalCountReturns: totalCounts[1],
        totalCountCheckItem: totalCounts[2],
        allitemRequests
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PUT(req: NextRequest) {
    const { data } = await req.json();

    const updateItemRequest = await prisma.itemRequest.update({
        where: {
            id: data.requestId,
        },
        data: {
            requestStatusId: 4
        },
        include:{
            item: true,
        }
    });

    const user = await prisma.user.findUnique({
        where: {
            firebaseUid: data.userId,
        },
        include: {
            role: true
        }
    });

    // If the Prisma transaction was successful, send notification
    if (updateItemRequest) {
        const borrower = await prisma.user.findUnique({
            where: {
                firebaseUid: updateItemRequest.borrowerId
            }
        });

        // Mark previous notifications related to this request as read
        const notificationsRef = collection(db, "notifications");
        const q = query(notificationsRef, where("requestId", "==", data.requestId), where("isRead", "==", false));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, { isRead: true });
        });

        if (borrower) {
            const notification = {
                isRead: false,
                fromRole: user?.role.name,
                toRole: ['Student', "Teacher", "Admin", "Supervisor"],
                message: `${updateItemRequest.item.name} succesfully received`,
                timeStamp: new Date(),
                requestId: updateItemRequest.id,
                userId: borrower.firebaseUid,
                targets: [`${borrower.firebaseUid}`]
            };

            // Add the notification to the 'notifications' collection in Firestore
            try {
                await addDoc(collection(db, "notifications"), notification);
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        }
    }

    return new Response(JSON.stringify(updateItemRequest), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};