import prisma from "@/services/db";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest, { params }: {params: {id: string}}) {
    const id = params.id
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId") || '';
    

    const requestDelete = await prisma.itemRequest.delete({
        where: {
            id: parseInt(id, 10)
        },
    });

    const updateItem = await prisma.item.update({
        where: {
            id: parseInt(itemId, 10),
        },
        data: {
            itemStatusId: 1
        },
    });

    return new Response(JSON.stringify({requestDelete, updateItem}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}