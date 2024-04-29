import prisma from '@/services/db';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const data = await req.json();
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