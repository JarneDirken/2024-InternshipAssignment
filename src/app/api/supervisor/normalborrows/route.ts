import prisma from "@/services/db";
import { Prisma } from "@prisma/client";
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

    const orderBy = createNestedOrderBy(sortBy, sortDirection);

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
        orderBy: orderBy,
        skip: offset, // infinate scroll
        take: limit // infinate scroll
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
