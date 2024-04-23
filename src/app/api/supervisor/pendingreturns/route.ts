import prisma from "@/services/db";
import { NextApiRequest } from "next";
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

    const itemRequests = await prisma.itemRequest.findMany({
        where: {
            item: {
                name: { contains: nameFilter, mode: 'insensitive' },
                itemStatusId: 4,
            },
            requestStatusId: 5,
        },
        include: { 
            item: {
                include: {
                    location: true
                }
            },
            borrower: {

            },
            approver: {

            }
        },
        orderBy: {
            requestDate: "desc"
        }
    });

    return new Response(JSON.stringify(itemRequests), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PUT(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    const updateItemRequest = await prisma.itemRequest.update({
        where: {
            id: data.requestId,
        },
        data: {
            requestStatusId: 6
        },
    });    

    return new Response(JSON.stringify(updateItemRequest), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};