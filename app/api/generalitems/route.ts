import prisma from '@/services/db';
import { NextApiRequest } from 'next';

export async function GET(req: NextApiRequest) {
    const generalItems = await prisma.generalItem.findMany();

    return new Response(JSON.stringify(generalItems), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function POST(req: NextApiRequest) {
    const data = await new Response(req.body).json();
    const createGeneralItem = await prisma.generalItem.create({
        data: data
    });

    return new Response(JSON.stringify(createGeneralItem), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}