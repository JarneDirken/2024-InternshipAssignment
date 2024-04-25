import prisma from "@/services/db";
import { Prisma } from "@prisma/client";
import { NextApiRequest } from "next";
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
        orderBy: {
            requestDate: "desc"
        }
    });

    const totalCounts = await Promise.all(dynamicWhereClauses.map(clause =>
        prisma.itemRequest.count({ where: clause })
    ));
    return new Response(JSON.stringify({
        itemRequests,
        totalCount: totalCounts[0],
        totalCountReturns: totalCounts[1],
        totalCountCheckItem: totalCounts[2],
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PUT(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    const updateItemRequest = await prisma.itemRequest.update({
        where: {
            id: data.requestId,
        },
        data: {
            requestStatusId: 4
        },
    });    

    return new Response(JSON.stringify(updateItemRequest), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};