import { GroupedItem, Item } from '@/models/Item';
import prisma from '@/services/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nameFilter = searchParams.get('name') || '';
    const modelFilter = searchParams.get('model') || '';
    const brandFilter = searchParams.get('brand') || '';
    const locationFilter = searchParams.get('location') || '';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

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

    const groupedItems = groupItems(items as unknown as Item[]);
    const paginatedGroups = groupedItems.slice(offset, offset + limit);

    return new Response(JSON.stringify({ items: paginatedGroups, totalCount }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function groupItems(items: Item[]): GroupedItem[] {
    const grouped: Record<string, GroupedItem> = {};

    items.forEach(item => {
        const key = `${item.name}-${item.model}-${item.brand}-${item.locationId}-${item.itemStatusId}`;

        if (!grouped[key]) {
            grouped[key] = { ...item, count: 1 };
        } else {
            grouped[key].count++;
        }
    });

    return Object.values(grouped);
}
