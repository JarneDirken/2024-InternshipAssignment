import prisma from '@/services/db';
import { NextApiRequest, NextApiResponse } from 'next';
import admin from '@/services/firebase-admin-config';
import { headers } from 'next/headers'

export async function GET(res: NextApiResponse, { params }: {params: {id: string}}) {
    try {
        const token = (headers().get('authorization'));
        if (!token) {
            return new Response(JSON.stringify({error: 'Unauthorized - No token provided'}), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Verify the token using Firebase Admin
        await admin.auth().verifyIdToken(token);

        const id = params.id
        const item = await prisma.item.findFirst({
            where: {
                id: parseInt(id, 10)
            },
            include: { location: true },
        });

        if (item === null) {
            // if no item found -> 404
            return new Response(null, {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        return new Response(JSON.stringify(item), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}