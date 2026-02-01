import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token.value, SECRET_KEY);

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        isApproved: true,
        createdAt: true,
        permissions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse permissions for client
    const formattedUsers = users.map(user => ({
      ...user,
      permissions: JSON.parse(user.permissions || '[]')
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}