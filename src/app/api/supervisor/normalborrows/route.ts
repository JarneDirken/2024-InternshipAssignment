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

    const itemRequests = await prisma.itemRequest.findMany({
        where: {
            item: {
                name: { contains: nameFilter, mode: 'insensitive' },
                itemStatusId: 2,
            },
            isUrgent: false,
            requestStatusId: 1,
        },
        include: { 
            item: {
                include: {
                    location: true
                }
            },
            borrower: {

            }
        },
        orderBy: {
            requestDate: "desc"
        }
    });

    const totalCount = await prisma.itemRequest.count({
        where: {
            item: {
                itemStatusId: 2,
            },
            isUrgent: false,
            requestStatusId: 1,
        }
    });

    const totalCountUrgent = await prisma.itemRequest.count({
        where: {
            item: {
                itemStatusId: 2,
            },
            isUrgent: true,
            requestStatusId: 1,
        }
    });

    const totalCountAll = await prisma.itemRequest.count({
        where: {
            item: {
                itemStatusId: {
                    in: [1,3,4,5,6]
                }
            },
            requestStatusId: {
                in: [2,3,4,5,6,7]
            }
        }
    });

    return new Response(JSON.stringify({itemRequests, totalCount, totalCountUrgent, totalCountAll}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}