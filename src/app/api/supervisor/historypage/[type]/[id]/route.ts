import prisma from "@/services/db";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
interface WhereClause extends Prisma.ItemRequestWhereInput {}

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
            lastOrderBy[field] = sortDirection;
        } else {
            lastOrderBy[field] = {}; 
            lastOrderBy = lastOrderBy[field] as OrderByType; 
        }
    });

    return currentOrderBy;
}

export async function GET(request: NextRequest, {params}: {params: {type: string, id: string}}) {
    const type = params.type;
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const nameFilterUser = searchParams.get('nameUser') || '';
    const nameFilterItem = searchParams.get('nameItem') || '';
    const borrowDateUser = searchParams.get('borrowDateUser');
    const returnDateUser = searchParams.get('returnDateUser');
    const borrowDateItem = searchParams.get('borrowDateItem');
    const returnDateItem = searchParams.get('returnDateItem');
    const sortBy = searchParams.get('sortBy') || 'requestDate';  // Default sort field
    const sortDirection = searchParams.get('sortDirection') as Prisma.SortOrder || 'desc';  // Default sort direction

    const orderBy = createNestedOrderBy(sortBy, sortDirection);

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

    if (type === 'user') {
        const whereClause: WhereClause = {
            item: {
                name: { contains: nameFilterUser, mode: 'insensitive' },
            },
        };
        // Handle date filters
        if (borrowDateUser) {
            const borrowDateStart = new Date(borrowDateUser);
            borrowDateStart.setHours(0, 0, 0, 0);
            whereClause.startBorrowDate = {
                gte: borrowDateStart
            };
        }
        
        if (returnDateUser) {
            const returnDateEnd = new Date(returnDateUser);
            returnDateEnd.setHours(23, 59, 59, 999);
            whereClause.endBorrowDate = {
                lte: returnDateEnd
            };
        }
        const data = await fetchUserHistory(parseInt(id, 10), orderBy, whereClause);
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } else if (type === 'item') {
        const whereClauseItem: WhereClause = {
            borrower: {
                firstName: { contains: nameFilterItem, mode: 'insensitive' },
            },
        };
        // Handle date filters
        if (borrowDateItem) {
            const borrowDateStart = new Date(borrowDateItem);
            borrowDateStart.setHours(0, 0, 0, 0);
            whereClauseItem.startBorrowDate = {
                gte: borrowDateStart
            };
        }
        
        if (returnDateItem) {
            const returnDateEnd = new Date(returnDateItem);
            returnDateEnd.setHours(23, 59, 59, 999);
            whereClauseItem.endBorrowDate = {
                lte: returnDateEnd
            };
        }
        const data = await fetchItemHistory(parseInt(id, 10), whereClauseItem, orderBy);
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


async function fetchUserHistory(userId: number, orderBy: OrderByType, whereClause: WhereClause) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            role: true,
            ItemRequestsBorrower: {
                where: whereClause,
                include: {
                    borrower: {
                        include: {
                            role: true,
                        }
                    },
                    approver: true,
                    item: {
                        include: {
                            location: true,
                            Reparations: true,
                        },
                    },
                    requestStatus: true,
                },
                orderBy: orderBy
            }
        }
    });
    return user;
}

async function fetchItemHistory(itemId: number, whereClause: WhereClause, orderBy: OrderByType) {
    const item = await prisma.item.findUnique({
        where: {
            id: itemId,
        },
        include: {
            location: true,
            ItemRequests: {
                where: whereClause,
                include: {
                    borrower: {
                        include: {
                            role: true,
                        }
                    },
                    approver: true,
                    item: {
                        include: {
                            Reparations: {
                                include: {
                                    item: true,
                                }
                            },
                            location: true,
                        }
                    }
                },
                orderBy: orderBy
            },
            Reparations: true,
        }
    });
    return item;
}