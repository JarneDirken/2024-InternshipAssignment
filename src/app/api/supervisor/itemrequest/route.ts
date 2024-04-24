import prisma from "@/services/db";
import { Prisma } from "@prisma/client";
import { NextApiRequest } from "next";
import { NextRequest } from "next/server";
interface WhereClause extends Prisma.ItemRequestWhereInput {}

export async function PUT(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    const updateItemRequest = await prisma.itemRequest.update({
        where: {
            id: data.requestId,
        },
        data: {
            requestStatus: {
                connect: {
                    id: data.requestStatusId
                }
            },
            approver: {
                connect: {
                    firebaseUid: data.approverId
                }
            },
            decisionDate: data.decisionDate,
            approveMessage: data.approveMessage,
            borrowDate: data.borrowDate,
            returnDate: data.returnDate,
        },
    });    

    const updateItem = await prisma.item.update({
        where: {
            id: data.itemId,
        },
        data: {
            itemStatusId: data.requestStatusId === 2 ? 3 : data.requestStatusId === 3 ? 1 : undefined
        },
    });

    return new Response(JSON.stringify({updateItemRequest, updateItem}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

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
            itemStatusId: {
                in: [1,3,4,5,6]
            }
        },
        requestStatusId: {
            in: [2,3,4,5,6,7]
        },
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
        orderBy: {
            decisionDate: "desc"
        }
    });

    return new Response(JSON.stringify(itemRequests), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};