import prisma from '@/services/db';
import { db } from '@/services/firebase-config';
import { collection, addDoc } from "firebase/firestore"; 
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

export async function POST(req: NextApiRequest) {
    const { data } = await new Response(req.body).json();

    let createItemRequest : any;

    const result = await prisma.$transaction(async (prisma) => {
        // Check if the item already has an active request with itemStatusId: 3
        const existingRequest = await prisma.itemRequest.findFirst({
            where: {
                itemId: data.itemId,
                item: {
                    itemStatusId: 2,
                },
            },
        });

        if (existingRequest) {
            throw new Error("Item is already in a request.");
        }

        createItemRequest = await prisma.itemRequest.create({
            data: {
                item: {
                    connect: { id: data.itemId },
                },
                requestStatus: {
                    connect: { id: data.requestStatusId },
                },
                borrower: {
                    connect: { firebaseUid: data.borrowerId },
                },
                requestDate: data.requestDate,
                startBorrowDate: data.startBorrowDate,
                endBorrowDate: data.endBorrowDate,
                file: data.file,
                isUrgent: data.isUrgent,
                amountRequest: data.amountRequest,
            },
        });

        const updateItem = await prisma.item.update({
            where: {
                id: data.itemId,
            },
            data: {
                itemStatusId: 2,
            },
        });

        return { createItemRequest, updateItem:updateItem };
    });

    // If the Prisma transaction was successful, send notifications
    if (result) {
        const user = await prisma.user.findUnique({
            where: {
                firebaseUid: data.borrowerId,
            },
            include: {
                role: true,
            }
        });

        const supervisorsAndAdmins = await prisma.user.findMany({
            where: {
                OR: [
                    { role: { name: "Supervisor" } },
                    { role: { name: "Admin" } }
                ],
            },
        });

        try {
            await Promise.all(supervisorsAndAdmins.map(supervisor => {
                const notification = {
                    isRead: false,
                    fromRole: user?.role.name,
                    toRole: ["Supervisor", "Admin"],
                    message: `${data.isUrgent ? 'New urgent borrow request' : 'New borrow request'} from ${user?.firstName} ${user?.lastName}`,
                    timeStamp: new Date(),
                    requestId: createItemRequest.id,
                    userId: data.borrowerId,
                    targets: ["Supervisor", "Admin"]
                };

                // Add the notification to the 'notifications' collection in Firestore
                return addDoc(collection(db, "notifications"), notification);
            }));
        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    };

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

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
    }

    const itemRequests = await prisma.itemRequest.findMany({
        where: {
            borrowerId: uid,
            item: {
                name: { contains: nameFilter, mode: 'insensitive' },
                model: { contains: modelFilter, mode: 'insensitive' },
                brand: { contains: brandFilter, mode: 'insensitive' },
                location: { name: { contains: locationFilter, mode: 'insensitive' } },
                itemStatusId: {
                    in: [1,2,3]
                }
            },
            requestStatusId: {
                in: [1, 2, 3]
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
            requestDate: "desc"
        }
    });

    const totalCount = await prisma.itemRequest.count({
        where: {
            borrowerId: uid,
            item: {
                itemStatusId: {
                    in: [1,2,3]
                }
            },
            requestStatusId: {
                in: [1, 2, 3]
            }
        }
    });

    return new Response(JSON.stringify({itemRequests, totalCount}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}