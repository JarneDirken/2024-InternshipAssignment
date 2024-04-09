import prisma from "@/services/db";

export async function GET() {
    const items = await prisma.item.findMany({
        where: {
            active: true,
        },
        include: { location: true },
    });

    return new Response(JSON.stringify( items ), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}