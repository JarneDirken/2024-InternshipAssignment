import prisma from "@/services/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';

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
    }

    let whereClause = {
        active: true,
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

    return new Response(JSON.stringify( items ), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}