import prisma from '@/services/db';
import { NextApiRequest } from 'next';

export async function GET(req: NextApiRequest) {
    const items = await prisma.item.findMany();

    return new Response(JSON.stringify(items), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function POST(req: NextApiRequest) {
    const data = await new Response(req.body).json();
    const createItem = await prisma.item.create({
        data: data
    });

    return new Response(JSON.stringify(createItem), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}