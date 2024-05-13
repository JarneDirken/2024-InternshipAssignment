import { GroupedItem, Item } from '@/models/Item';
import prisma from '@/services/db';
import admin from '@/services/firebase-admin-config';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const token = searchParams.get("token") || '';
    const nameFilter = searchParams.get('name') || '';
    const modelFilter = searchParams.get('model') || '';
    const brandFilter = searchParams.get('brand') || '';
    const locationFilter = searchParams.get('location') || '';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    const user = await prisma.user.findUnique({
        where: {
            firebaseUid: uid,
        },
        include: {
            role: true,
        }
    });

    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken) {
        return new Response(JSON.stringify("Unauthorized"), {
            status: 403,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    if (!user){
        return new Response(JSON.stringify("User not found"), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    if (!["Admin", "Supervisor", "Teacher", "Student"].includes(user.role.name)) {
        return new Response(JSON.stringify("Forbidden, you don't have the rights to make this call"), {
            status: 403, // Use 403 for Forbidden instead of 404
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    let whereClause = {
        active: true,
        name: { contains: nameFilter, mode: 'insensitive' as const },
        model: { contains: modelFilter, mode: 'insensitive' as const },
        brand: { contains: brandFilter, mode: 'insensitive' as const },
        location: { name: { contains: locationFilter, mode: 'insensitive' as const } },
        RoleItem: {
            some: {
                roleId: {
                    lte: user.roleId,
                }
            }
        },
    };

    const items = await prisma.item.findMany({
        where: whereClause,
        include: { location: true },
        orderBy: {
            name: 'asc',
        },
    });
    
    const totalCount = await prisma.item.count({ where: whereClause });

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
        const key = `${item.name}-${item.model}-${item.brand}-${item.locationId}`;

        if (!grouped[key]) {
            grouped[key] = { ...item, availableCount: 0, borrowedCount: 0, items: [] };
        }

        // Add current item to the items array
        grouped[key].items.push(item);

        // Sort items within the group so available ones are first
        grouped[key].items.sort((a, b) => (a.itemStatusId === 1 ? -1 : 1));

        // Recount available and borrowed items
        grouped[key].availableCount = grouped[key].items.filter(i => i.itemStatusId === 1).length;
        grouped[key].borrowedCount = grouped[key].items.filter(i => i.itemStatusId !== 1).length;
    });

    return Object.values(grouped);
}
