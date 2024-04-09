import prisma from '@/services/db';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

export async function POST(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    const createItemRequest = await prisma.itemRequest.create({
        data: {
            item: {
                connect: { id: data.itemId },
            },
            requestStatus: {
                connect: { id: data.requestStatusId },
            },
            borrower: {
                connect: { firebaseUid: data.borrowerId },
            },
            requestDate: data.requestDate,
            startBorrowDate: data.startBorrowDate,
            endBorrowDate: data.endBorrowDate,
            file: data.file,
            isUrgent: data.isUrgent,
            amountRequest: data.amountRequest,
        },
    });

    const updateItem = await prisma.item.update({
        where: {
            id: data.itemId,
        },
        data: {
            itemStatusId: 2
        },
    });

    return new Response(JSON.stringify({createItemRequest, updateItem}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
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
    }

    const itemRequests = await prisma.itemRequest.findMany({
        where: {
            borrowerId: uid
        },
        include: { 
            item: {
                include: {
                    location: true
                }
            }
        },
    });

    const totalCount = await prisma.itemRequest.count({
        where: {
            borrowerId: uid
        }
    });

    return new Response(JSON.stringify({itemRequests, totalCount}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}