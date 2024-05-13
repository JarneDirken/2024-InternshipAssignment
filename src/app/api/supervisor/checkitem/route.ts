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

    const whereClause: WhereClause = {
        item: {
            name: { contains: nameFilter, mode: 'insensitive' },
            location: { 
                name: {contains: locationFilter, mode: 'insensitive'}
            },
        },
        requestStatusId: 6,
        borrower: { 
            firstName: { contains: requestorFilter, mode: 'insensitive'}
        },
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

    return new Response(JSON.stringify(itemRequests), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PUT(req: NextRequest) {
    const { data } = await req.json();

    const results = await prisma.$transaction(async prisma => {
        const updateItemRequest = await prisma.itemRequest.update({
            where: { id: data.requestId },
            data: { requestStatusId: 7 },
            include: { item: true, }
        });

        const updateItem = await prisma.item.update({
            where: { id: data.itemId },
            data: { itemStatusId: data.repairState ? 5 : 1 },
        });

        let createReparation = null;
        if (data.repairState) {
            createReparation = await prisma.reparation.create({
                data: {
                    itemId: data.itemId,
                    repairDate: new Date(),
                    notes: data.message
                }
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                firebaseUid: data.userId,
            },
            include: {
                role: true
            }
        });
    
        // Mark previous notifications related to this request as read
        const notificationsRef = collection(db, "notifications");
        const q = query(notificationsRef, where("requestId", "==", data.requestId), where("isRead", "==", false));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, { isRead: true });
        });
    
        if (updateItemRequest) {
            const messageSuffix = data.repairState === 5 ? "put in repair" : "checked";
            const notification = {
                isRead: true,
                fromRole: user?.role.name,
                toRole: ['Student', "Teacher", "Admin", "Supervisor"],
                message: `${updateItemRequest.item.name} succesfully ${messageSuffix}`,
                timeStamp: new Date(),
                requestId: updateItemRequest.id,
            };
    
            // Add the notification to the 'notifications' collection in Firestore
            try {
                await addDoc(collection(db, "notifications"), notification);
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        }

        return { updateItemRequest, updateItem, createReparation };
    });

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};