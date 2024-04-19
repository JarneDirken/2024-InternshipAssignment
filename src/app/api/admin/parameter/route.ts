import prisma from '@/services/db';
import { NextApiRequest } from "next";

export async function GET() {
    const parameters = await prisma.parameter.findMany();

    return new Response(JSON.stringify(parameters), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export async function PUT(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    const results = await prisma.$transaction([
        prisma.parameter.updateMany({
            where: { name: 'morningStartTime' },
            data: { value: data.morningStartTime },
        }),
        prisma.parameter.updateMany({
            where: { name: 'morningEndTime' },
            data: { value: data.morningEndTime },
        }),
        prisma.parameter.updateMany({
            where: { name: 'eveningStartTime' },
            data: { value: data.eveningStartTime },
        }),
        prisma.parameter.updateMany({
            where: { name: 'eveningEndTime' },
            data: { value: data.eveningEndTime },
        }),
    ]);

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};