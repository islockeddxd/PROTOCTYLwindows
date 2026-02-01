import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';
import { config } from '@/lib/config';

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(session, SECRET_KEY);

    // Fetch fresh data from DB
    const user = await prisma.user.findUnique({
      where: { username: payload.username as string }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      username: user.username,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]')
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
  }
}
