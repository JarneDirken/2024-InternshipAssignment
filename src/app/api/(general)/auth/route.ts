import prisma from '@/services/db';
import { NextApiRequest } from 'next';

export async function POST(req: NextApiRequest) {
    const { uid } = await new Response(req.body).json();

    const userData = await prisma.user.findUnique({
        where: {
            firebaseUid: uid,
        },
        include: {
            role: true,
        },
    });

    if (userData) {
        return new Response(JSON.stringify({ role: userData.role.name }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } else {
        return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}