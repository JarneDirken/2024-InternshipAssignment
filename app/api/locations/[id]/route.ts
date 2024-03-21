import prisma from '@/services/db';
import { NextApiRequest } from 'next';

export async function GET(req: NextApiRequest, { params }: {params: {id: string}}) {
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

export async function DELETE(req: NextApiRequest, { params }: {params: {id: string}}) {
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

export async function PATCH(req: NextApiRequest, { params }: {params: {id: string}}){
    const id = params.id
    const data = await new Response(req.body).json();
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