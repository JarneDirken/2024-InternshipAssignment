import prisma from "@/services/db";
import admin from "@/services/firebase-admin-config";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const token = searchParams.get("token") || '';

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