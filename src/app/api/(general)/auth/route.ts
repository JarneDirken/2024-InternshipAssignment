import prisma from '@/services/db';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const { uid } = await req.json();
    
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

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || '';

    const user = await prisma.user.findUnique({
        where: {
            active: true,
            email: email,
        }
    });

    if (!user) {
        return new Response(JSON.stringify({ message: "E-mail does not exist or user is not active." }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(JSON.stringify(user), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}