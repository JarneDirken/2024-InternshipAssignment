import prisma from '@/services/db';
import { NextApiRequest, NextApiResponse } from 'next';

export async function GET(res: NextApiResponse, { params }: {params: {id: string}}) {
    const id = params.id
    const generalItem = await prisma.generalItem.findFirst({
        where: {
            id: parseInt(id, 10)
        }
    });

    if (generalItem === null) {
        // if no item found -> 404
        return new Response(null, {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(JSON.stringify(generalItem), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function DELETE(req: NextApiRequest, { params }: {params: {id: string}}) {
    const id = params.id
    const generalItem = await prisma.generalItem.delete({
        where: {
            id: parseInt(id, 10)
        }
    });

    return new Response(JSON.stringify(generalItem), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PATCH(req: NextApiRequest, { params }: {params: {id: string}}){
    const id = params.id
    const data = await new Response(req.body).json();
    const generalItem = await prisma.generalItem.update({
        where: {id: parseInt(id, 10)},
        data: data
    });

    return new Response(JSON.stringify(generalItem), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}