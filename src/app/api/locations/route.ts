import prisma from '@/services/db';
import { NextApiRequest, NextApiResponse } from 'next';
import admin from '@/services/firebase-admin-config';
import { headers } from 'next/headers'

// export async function GET(req: NextApiRequest) {
//     const locations = await prisma.location.findMany();

//     return new Response(JSON.stringify(locations), {
//         status: 200,
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     });
// }

export async function GET(req: NextApiRequest, res: NextApiResponse) {
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

        const locations = await prisma.location.findMany();

        return new Response(JSON.stringify(locations), {
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

export async function POST(req: NextApiRequest) {
    const data = await new Response(req.body).json();
    const created = await prisma.location.create({
        data: data
    });

    return new Response(JSON.stringify(created), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}