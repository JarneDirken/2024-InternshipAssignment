import prisma from "@/services/db";
import { Prisma } from "@prisma/client";
import { NextApiRequest } from "next";
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
    const locationFilter = searchParams.get('location') || '';
    const requestorFilter = searchParams.get('requestor') || '';
    const sortBy = searchParams.get('sortBy') || 'requestDate';  // Default sort field
    const sortDirection = searchParams.get('sortDirection') as Prisma.SortOrder || 'desc';  // Default sort direction

    const orderBy = createNestedOrderBy(sortBy, sortDirection);

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

    const whereClause: WhereClause = {
        item: {
            name: { contains: nameFilter, mode: 'insensitive' },
            location: { 
                name: {contains: locationFilter, mode: 'insensitive'}
            },
        },
        requestStatusId: 6,
        borrower: { 
            firstName: { contains: requestorFilter, mode: 'insensitive'}
        },
    };
    
    if (borrowDate) {
        const borrowDateStart = new Date(borrowDate);
        borrowDateStart.setHours(0, 0, 0, 0);  // Set to start of the day
        whereClause.borrowDate = {
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

    const itemRequests = await prisma.itemRequest.findMany({
        where: whereClause,
        include: { 
            item: {
                include: {
                    location: true
                }
            },
            borrower: true,
            approver: true,
        },
        orderBy: orderBy
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

    const results = await prisma.$transaction(async prisma => {
        const updateItemRequest = await prisma.itemRequest.update({
            where: { id: data.requestId },
            data: { requestStatusId: 7 },
        });

        const updateItem = await prisma.item.update({
            where: { id: data.itemId },
            data: { itemStatusId: data.repairState ? 5 : 1 },
        });

        let createReparation = null;
        if (data.repairState) {
            createReparation = await prisma.reparation.create({
                data: {
                    itemId: data.itemId,
                    repairDate: new Date(),
                    notes: data.message
                }
            });
        }

        return { updateItemRequest, updateItem, createReparation };
    });

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};