import prisma from "@/services/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, {params}: {params: {type: string, id: string}}) {
    const type = params.type;
    const id = params.id;
    if (type === 'user') {
        const data = await fetchUserHistory(parseInt(id, 10));
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } else if (type === 'item') {
        const data = await fetchItemHistory(parseInt(id, 10));
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } else {
        return new Response(JSON.stringify("Not found"), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}


async function fetchUserHistory(userId: number) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            role: true,
            ItemRequestsBorrower: {
                include: {
                    item: true,
                }
            }
        }
    });
    return user;
}

async function fetchItemHistory(itemId: number) {
    const item = await prisma.item.findUnique({
        where: {
            id: itemId,
        },
        include: {
            location: true,
            ItemRequests: {
                include: {
                    borrower: true,
                    approver: true,
                }
            },
            Reparations: true,
        }
    });
    return item;
}