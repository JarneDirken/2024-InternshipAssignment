import prisma from '@/services/db';
import { NextApiRequest } from 'next';

export async function POST(req: NextApiRequest) {
        const data = await new Response(req.body).json();
    const created = await prisma.user.create({
        data: data
    });

    return new Response(JSON.stringify(created), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}