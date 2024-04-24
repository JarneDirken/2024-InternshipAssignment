import prisma from "@/services/db";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
interface WhereClause extends Prisma.ItemRequestWhereInput {}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const nameFilter = searchParams.get('name') || '';
    const borrowDate = searchParams.get('borrowDate');
    const returnDate = searchParams.get('returnDate');
    const locationFilter = searchParams.get('location') || '';
    const requestorFilter = searchParams.get('requestor') || '';

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
        item: {
            name: { contains: nameFilter, mode: 'insensitive' },
            location: { 
                name: {contains: locationFilter, mode: 'insensitive'}
            },
            itemStatusId: 2,
        },
        isUrgent: false,
        requestStatusId: 1,
        borrower: { 
            firstName: { contains: requestorFilter, mode: 'insensitive'}
        },
    };
    
    if (borrowDate) {
        const borrowDateStart = new Date(borrowDate);
        borrowDateStart.setHours(0, 0, 0, 0);  // Set to start of the day
        whereClause.startBorrowDate = {
            gte: borrowDateStart
        };
    }
    
    if (returnDate) {
        const returnDateEnd = new Date(returnDate);
        returnDateEnd.setHours(23, 59, 59, 999);  // Set to end of the day
        whereClause.endBorrowDate = {
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
            borrower: true
        },
        orderBy: {
            requestDate: "desc"
        }
    });

    const totalCount = await prisma.itemRequest.count({
        where: {
            item: {
                itemStatusId: 2,
            },
            isUrgent: false,
            requestStatusId: 1,
        }
    });

    const totalCountUrgent = await prisma.itemRequest.count({
        where: {
            item: {
                itemStatusId: 2,
            },
            isUrgent: true,
            requestStatusId: 1,
        }
    });

    const totalCountAll = await prisma.itemRequest.count({
        where: {
            item: {
                itemStatusId: {
                    in: [1,3,4,5,6]
                }
            },
            requestStatusId: {
                in: [2,3,4,5,6,7]
            }
        }
    });

    return new Response(JSON.stringify({itemRequests, totalCount, totalCountUrgent, totalCountAll}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}