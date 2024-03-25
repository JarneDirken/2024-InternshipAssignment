import prisma from '@/services/db';
import { NextApiRequest } from 'next';

export async function GET(req: NextApiRequest, { params }: {params: {uid: string}}) {
    const uid = params.uid

    const user = await prisma.user.findUnique({
        where: {
            firebaseUid: uid,
        },
        include: {
            role: true,
        }
    });
    
    if (user) {
        return new Response(JSON.stringify(user), {
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