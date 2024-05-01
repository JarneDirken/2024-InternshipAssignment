import prisma from "@/services/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, {params}: {params: {id: string}}) {
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';

    const user = await prisma.user.findUnique({
        where: {
            firebaseUid: uid,
        },
    });

    if (!user) {
        return new Response(JSON.stringify("User not found"), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const item = await prisma.item.findUnique({
        where: {
            id: parseInt(id, 10)
        },
        include: {
            location: true,
            ItemRequests: {
                include: {
                    item: {
                        include: {
                            location: true,
                        }
                    },
                    approver: true,
                    borrower: true,
                    requestStatus: true,
                }
            },
        }
    });

    if (!item) {
        return new Response(JSON.stringify("Item not found"), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    return new Response(JSON.stringify(item), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}