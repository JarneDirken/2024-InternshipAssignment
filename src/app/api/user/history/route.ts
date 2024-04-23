import prisma from '@/services/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const nameFilter = searchParams.get('name') || '';

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
            borrowerId: uid,
            item: {
                name: { contains: nameFilter, mode: 'insensitive' },
            },
            requestStatusId: {
                in: [6, 7]
            }
        },
        include: { 
            item: {
                include: {
                    location: true
                }
            }
        },
        orderBy: {
            returnDate: "desc"
        }
    });
    
    const totalCount = await prisma.itemRequest.count({
        where: {
            borrowerId: uid,
            requestStatusId: {
                in: [6, 7]
            }
        }
    });

    return new Response(JSON.stringify({ itemRequests, totalCount }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}