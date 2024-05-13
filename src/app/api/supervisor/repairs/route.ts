import prisma from "@/services/db";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
interface WhereClause extends Prisma.ReparationWhereInput {}

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

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("userId") || '';
    const nameFilter = searchParams.get('name') || '';
    const borrowDate = searchParams.get('borrowDate');
    const returnDate = searchParams.get('returnDate');
    const sortBy = searchParams.get('sortBy') || 'repairDate';  // Default sort field
    const sortDirection = searchParams.get('sortDirection') as Prisma.SortOrder || 'desc';  // Default sort direction
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    const orderBy = createNestedOrderBy(sortBy, sortDirection);

    const user = await prisma.user.findUnique({
        where: {
            firebaseUid: uid,
        },
        include: {
            role: true,
        }
    });

    if (!user){
        return new Response(JSON.stringify("User not found"), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    if (!["Admin", "Supervisor"].includes(user.role.name)) {
        return new Response(JSON.stringify("Forbidden, you don't have the rights to make this call"), {
            status: 403, // Use 403 for Forbidden instead of 404
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const whereClause: WhereClause = {
        item: {
            name: { contains: nameFilter, mode: 'insensitive' },
            itemStatusId: 5,
        },
    };
    
    if (borrowDate) {
        const borrowDateStart = new Date(borrowDate);
        borrowDateStart.setHours(0, 0, 0, 0);  // Set to start of the day
        whereClause.repairDate = {
            gte: borrowDateStart
        };
    }
    
    if (returnDate) {
        const returnDateEnd = new Date(returnDate);
        returnDateEnd.setHours(23, 59, 59, 999);  // Set to end of the day
        whereClause.returnDate = {
            lte: returnDateEnd
        };
    }

    const repairs = await prisma.reparation.findMany({
        where: whereClause,
        include: {
            item: {
                include: {
                    location: true,
                    ItemRequests: {
                        include: {
                            borrower: true
                        }
                    }
                }
            },
        },
        orderBy: orderBy,
        skip: offset, // infinate scroll
        take: limit // infinate scroll
    });

    const totalCount = await prisma.reparation.count({
        where: whereClause,
    });

    return new Response(JSON.stringify({repairs, totalCount}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PUT(req: NextRequest) {
    const { data } = await req.json();

    const updateRepair = await prisma.reparation.update({
        where: {
            id: data.repairId,
        },
        data: {
            item: {
                update: {
                    where: {
                        id: data.itemId
                    },
                    data: {
                        itemStatusId: data.broken ? 6 : 1
                    }
                }
            },
            returnDate: data.broken ? null : new Date(),
        },
    });

    return new Response(JSON.stringify(updateRepair), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};