import prisma from '@/services/db';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nameFilter = searchParams.get('name') || '';
    const modelFilter = searchParams.get('model') || '';
    const brandFilter = searchParams.get('brand') || '';
    const locationFilter = searchParams.get('location') || '';

    const items = await prisma.item.findMany({
        where: {
            // Ensure the itemStatusId and other conditions are correctly set
            itemStatusId: 1,
            active: true,
            name: { contains: nameFilter, mode: 'insensitive' },
            model: { contains: modelFilter, mode: 'insensitive' },
            brand: { contains: brandFilter, mode: 'insensitive' },
            location: { name: { contains: locationFilter, mode: 'insensitive' } }
        },
        include: { location: true },
    });

    const totalCount = await prisma.item.count({
        where: {
            itemStatusId: 1,
            name: { contains: nameFilter, mode: 'insensitive' },
            model: { contains: modelFilter, mode: 'insensitive' },
            brand: { contains: brandFilter, mode: 'insensitive' },
            location: { name: { contains: locationFilter, mode: 'insensitive' } }
        }
    });

    return new Response(JSON.stringify({ items, totalCount }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function POST(req: NextApiRequest) {
    const data = await new Response(req.body).json();
    const createItem = await prisma.item.create({
        data: data,
    });

    return new Response(JSON.stringify(createItem), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}