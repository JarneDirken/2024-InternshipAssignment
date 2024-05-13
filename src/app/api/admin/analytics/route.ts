import prisma from "@/services/db";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
interface WhereClause extends Prisma.ItemRequestWhereInput {}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const year = searchParams.get("year") || '';

    const user = await prisma.user.findUnique({
        where: {
            firebaseUid: uid,
        },
        include: {
            role: true,
        }
    });

    if (!user){
        return new Response(JSON.stringify("User not found"), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    if (!["Admin"].includes(user.role.name)) {
        return new Response(JSON.stringify("Forbidden, you don't have the rights to make this call"), {
            status: 403, // Use 403 for Forbidden instead of 404
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const whereClause: WhereClause = {
        ...(year && {
            startBorrowDate: {
                gte: new Date(`${year}-01-01T00:00:00.000Z`),
                lte: new Date(`${year}-12-31T23:59:59.999Z`)
            }
        }),
    };

    const itemRequests = await prisma.itemRequest.findMany({
        where: {
            ...whereClause,
            requestStatusId: {
                in: [6, 7],
            }
        },
        include: { 
            item: true,
            borrower: true,
            approver: true,
        },
    });

    const totalMade = await prisma.itemRequest.count({
        where: whereClause
    });

    const totalCancelled = await prisma.itemRequest.count({
        where: {
            ...whereClause,
            requestStatusId: 8,
        }
    });

    const totalFinished = await prisma.itemRequest.count({
        where: {
            ...whereClause,
            requestStatusId: {
                in: [6, 7],
            }
        }
    });

    return new Response(JSON.stringify({itemRequests, totalMade, totalCancelled, totalFinished}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};