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
            active: true,
            name: { contains: nameFilter, mode: 'insensitive' },
            model: { contains: modelFilter, mode: 'insensitive' },
            brand: { contains: brandFilter, mode: 'insensitive' },
            location: { name: { contains: locationFilter, mode: 'insensitive' } }
        },
        include: { location: true },
        orderBy: {
            name: 'asc', // Change 'name' to whichever field you want to sort by
        },
    });

    const totalCount = await prisma.item.count({
        where: {
            active: true,
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