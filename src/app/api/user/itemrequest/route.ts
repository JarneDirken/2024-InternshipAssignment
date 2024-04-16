import prisma from '@/services/db';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

export async function POST(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    // Check if the item already has an active request with itemStatusId: 3
    const existingRequest = await prisma.itemRequest.findFirst({
        where: {
            itemId: data.itemId,
            item: {
                itemStatusId: 2,
            },
        },
    });

    // If an existing request is found, return an error response
    if (existingRequest) {
        return new Response(JSON.stringify({ error: "Item is already in a request." }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

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
    const nameFilter = searchParams.get('name') || '';
    const modelFilter = searchParams.get('model') || '';
    const brandFilter = searchParams.get('brand') || '';
    const locationFilter = searchParams.get('location') || '';

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
            borrowerId: uid,
            item: {
                name: { contains: nameFilter, mode: 'insensitive' },
                model: { contains: modelFilter, mode: 'insensitive' },
                brand: { contains: brandFilter, mode: 'insensitive' },
                location: { name: { contains: locationFilter, mode: 'insensitive' } },
                itemStatusId: 2,
            },
            requestStatusId: 1,
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
            borrowerId: uid,
            item: {
                itemStatusId: 2,
            },
            requestStatusId: 1,
        }
    });

    return new Response(JSON.stringify({itemRequests, totalCount}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}