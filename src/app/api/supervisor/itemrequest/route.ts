import prisma from "@/services/db";
import { NextApiRequest } from "next";
import { NextRequest } from "next/server";

export async function PUT(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    const updateItemRequest = await prisma.itemRequest.update({
        where: {
            id: data.requestId,
        },
        data: {
            requestStatus: {
                connect: {
                    id: data.requestStatusId
                }
            },
            approver: {
                connect: {
                    firebaseUid: data.approverId
                }
            },
            decisionDate: data.decisionDate,
            approveMessage: data.approveMessage
        },
    });    

    const updateItem = await prisma.item.update({
        where: {
            id: data.itemId,
        },
        data: {
            itemStatusId: data.requestStatusId === 2 ? 3 : data.requestStatusId === 3 ? 1 : undefined
        },
    });

    return new Response(JSON.stringify({updateItemRequest, updateItem}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

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
                itemStatusId: {
                    in: [1,3,4,5,6]
                }
            },
            requestStatusId: {
                in: [2,3,4,5,6,7]
            },
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

            },
        },
        orderBy: {
            decisionDate: "desc"
        }
    });

    return new Response(JSON.stringify(itemRequests), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};