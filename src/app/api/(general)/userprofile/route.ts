import prisma from '@/services/db';
import { NextApiRequest } from 'next';

export async function PATCH(req: NextApiRequest) {
    const { data, uid } = await new Response(req.body).json();

    if (!uid) {
        return new Response(JSON.stringify({ error: 'Profile picture URL and UID are required' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const updatedUser = await prisma.user.update({
        where: { firebaseUid: uid },
        data: data,
        include: { role: true },
    });

    return new Response(JSON.stringify(updatedUser), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
