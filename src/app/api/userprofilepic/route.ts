import prisma from '@/services/db';
import { NextApiRequest } from 'next';

export async function PATCH(req: NextApiRequest) {
    const { profilePicUrl, uid } = await new Response(req.body).json();

    if (!uid) {
        return new Response(JSON.stringify({ error: 'UID is required' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    if (profilePicUrl === undefined) {
        return new Response(JSON.stringify({ error: 'Profile picture URL is required' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { firebaseUid: uid },
            data: { profilePic: profilePicUrl },
            include: { role: true },
        });

        return new Response(JSON.stringify(updatedUser), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        return new Response(JSON.stringify({ error: 'Error updating profile picture'}), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
