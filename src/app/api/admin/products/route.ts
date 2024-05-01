import prisma from "@/services/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const nameFilter = searchParams.get('name') || '';
    const modelFilter = searchParams.get('model') || '';
    const brandFilter = searchParams.get('brand') || '';
    const locationFilter = searchParams.get('location') || '';

    const user = await prisma.user.findUnique({
        where: {
            firebaseUid: uid,
        },
    });

    if (!user){
        return new Response(JSON.stringify("User not found"), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const items = await prisma.item.findMany({
        where: {
                name: { contains: nameFilter, mode: 'insensitive' },
        },
        include: { 
            RoleItem: true,
            location: true
        },
    });

    const roles = await prisma.role.findMany();

    const locations = await prisma.location.findMany();

    const itemStatuses = await prisma.itemStatus.findMany();

    return new Response(JSON.stringify({items, roles, locations, itemStatuses}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}