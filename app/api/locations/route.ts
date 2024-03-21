import prisma from '@/services/db';
import { NextApiRequest } from 'next';

export async function GET(req: NextApiRequest) {
    const locations = await prisma.location.findMany();

    return new Response(JSON.stringify(locations), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function POST(req: NextApiRequest) {
    const data = await req.body;

    const created = await prisma.location.create({
        data: data
    });

    return new Response(JSON.stringify(created), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}