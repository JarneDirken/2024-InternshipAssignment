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

    if (!user) {
        return new Response(JSON.stringify("User not found"), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    // Base where clause for all queries
    const baseWhereClause: WhereClause = {
        item: {
            name: { contains: nameFilter, mode: 'insensitive' },
            location: { 
                name: { contains: locationFilter, mode: 'insensitive' }
            },
            itemStatusId: 2,
        },
        requestStatusId: 1,
        borrower: { 
            firstName: { contains: requestorFilter, mode: 'insensitive' }
        },
    };

    // Handle date filters
    if (borrowDate) {
        const borrowDateStart = new Date(borrowDate);
        borrowDateStart.setHours(0, 0, 0, 0);
        baseWhereClause.startBorrowDate = {
            gte: borrowDateStart
        };
    }
    
    if (returnDate) {
        const returnDateEnd = new Date(returnDate);
        returnDateEnd.setHours(23, 59, 59, 999);
        baseWhereClause.endBorrowDate = {
            lte: returnDateEnd
        };
    }

    // Fetch item requests
    const itemRequests = await prisma.itemRequest.findMany({
        where: baseWhereClause,
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

    // Function to count item requests based on urgency
    const countRequests = async (isUrgent: boolean) => prisma.itemRequest.count({
        where: {
            ...baseWhereClause,
            isUrgent: isUrgent
        }
    });

    // Concurrently count non-urgent and urgent requests
    const [totalCount, totalCountUrgent] = await Promise.all([
        countRequests(false),
        countRequests(true)
    ]);

    return new Response(JSON.stringify({itemRequests, totalCount, totalCountUrgent}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
