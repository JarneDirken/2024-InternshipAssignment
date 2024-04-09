import prisma from '@/services/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nameFilter = searchParams.get('name') || '';
    const modelFilter = searchParams.get('model') || '';
    const brandFilter = searchParams.get('brand') || '';
    const locationFilter = searchParams.get('location') || '';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '7');

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
            name: 'asc',
        },
        skip: offset,
        take: limit,
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