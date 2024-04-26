import prisma from "@/services/db";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

interface OrderByType {
    [key: string]: Prisma.SortOrder | OrderByRecursiveType;
}

interface OrderByRecursiveType extends Record<string, Prisma.SortOrder | OrderByType> {}

function createNestedOrderBy(sortBy: string, sortDirection: Prisma.SortOrder): OrderByType {
    const fields = sortBy.split('.');
    let currentOrderBy: OrderByType = {};
    let lastOrderBy = currentOrderBy;

    fields.forEach((field, index) => {
        if (index === fields.length - 1) {
            lastOrderBy[field] = sortDirection;  // Set the final sort direction
        } else {
            lastOrderBy[field] = {};  // Create a nested object
            lastOrderBy = lastOrderBy[field] as OrderByType;  // Move deeper into the object
        }
    });

    return currentOrderBy;
}

export async function GET(request: NextRequest, {params}: {params: {type: string, id: string}}) {
    const type = params.type;
    const id = params.id;
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

    if (type === 'user') {
        const data = await fetchUserHistory(parseInt(id, 10), nameFilter);
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


async function fetchUserHistory(userId: number, nameFilter: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            role: true,
            ItemRequestsBorrower: {
                where: {
                    item: {
                        name: { contains: nameFilter, mode: 'insensitive' },
                    }
                },
                include: {
                    approver: true,
                    item: {
                        include: {
                            location: true,
                            Reparations: true,
                        },
                    },
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
                    item: {
                        include: {
                            location: true,
                        }
                    }
                }
            },
            Reparations: true,
        }
    });
    return item;
}