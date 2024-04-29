import prisma from '@/services/db';
import { NextRequest } from 'next/server';

export async function PATCH(req: NextRequest) {
    const { data, uid } = await req.json();

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
