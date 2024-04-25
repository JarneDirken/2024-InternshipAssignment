import prisma from '@/services/db';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
interface WhereClause extends Prisma.ItemRequestWhereInput {}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const nameFilter = searchParams.get('name') || '';
    const borrowDate = searchParams.get('borrowDate');
    const returnDate = searchParams.get('returnDate');

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
        },
        requestStatusId: { in: [6, 7] },
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
        orderBy: {
            endBorrowDate: "desc",
        },
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