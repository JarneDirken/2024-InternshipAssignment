import prisma from '@/services/db';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: {params: {id: string}}) {
    const id = params.id
    const location = await prisma.location.findFirst({
        where: {
            id: parseInt(id, 10)
        }
    });

    return new Response(JSON.stringify(location), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function DELETE(req: NextRequest, { params }: {params: {id: string}}) {
    const id = params.id
    const location = await prisma.location.delete({
        where: {
            id: parseInt(id, 10)
        }
    });

    return new Response(JSON.stringify(location), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PATCH(req: NextRequest, { params }: {params: {id: string}}){
    const id = params.id
    const data = await req.json();
    const updateLocation = await prisma.location.update({
        where: {id: parseInt(id, 10)},
        data: data
    });

    return new Response(JSON.stringify(updateLocation), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}