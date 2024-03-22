import prisma from '@/services/db';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const data = await new Response(req.body).json();
    const created = await prisma.user.create({
        data: data
    });

    return new Response(JSON.stringify(created), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          if (e.code === 'P2002') {
            console.log(
              'There is a unique constraint violation, a new user cannot be created with this email'
            )
          }
        }
        throw e
    }
}