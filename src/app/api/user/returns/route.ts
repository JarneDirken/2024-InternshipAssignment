import prisma from '@/services/db';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const nameFilter = searchParams.get('name') || '';

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

    const itemRequests = await prisma.itemRequest.findMany({
        where: {
            borrowerId: uid,
            item: {
                name: { contains: nameFilter, mode: 'insensitive' },
                itemStatusId: {
                    in: [3,4]
                },
            },
            requestStatusId: {
                in: [4,5]
            },
        },
        include: { 
            item: {
                include: {
                    location: true
                }
            }
        },
        orderBy: {
            endBorrowDate: "desc"
        }
    });
    
    const totalCount = await prisma.itemRequest.count({
        where: {
            borrowerId: uid,
            requestStatusId: {
                in: [4,5]
            },
            item: {
                itemStatusId: {
                    in: [3,4]
                },
            }
        }
    });

    return new Response(JSON.stringify({ itemRequests, totalCount }), {
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
            requestStatusId: 5
        },
    });

    const updateItem = await prisma.item.update({
        where: {
            id: data.itemId,
        },
        data: {
            itemStatusId: 4,
        }
    })

    return new Response(JSON.stringify({updateItemRequest, updateItem}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};