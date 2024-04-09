import prisma from '@/services/db';
import { NextApiRequest } from 'next';

export async function POST(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    const createItemRequest = await prisma.itemRequest.delete({
        where: {
            id: data.id
        }
    });

    const updateItem = await prisma.item.update({
        where: {
            id: data.itemId,
        },
        data: {
            itemStatusId: 1
        },
    });

    return new Response(JSON.stringify({createItemRequest, updateItem}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
