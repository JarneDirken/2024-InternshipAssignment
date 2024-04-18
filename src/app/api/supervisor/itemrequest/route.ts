import prisma from "@/services/db";
import { NextApiRequest } from "next";

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
}