import { NextResponse } from 'next/server';
import { getProperties, saveProperties } from '@/lib/propertiesManager';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);

// Helper to check permissions
async function checkPermission(perm: string) {
  const session = (await cookies()).get('session')?.value;
  if (!session) return false;
  try {
    const { payload } = await jwtVerify(session, SECRET_KEY);
    const userPerms = (payload.permissions as string[]) || [];
    return payload.role === 'admin' || userPerms.includes(perm);
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await checkPermission('settings'))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
  }
  try {
    const props = await getProperties();
    return NextResponse.json(props);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkPermission('settings'))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
  }

  try {
    const body = await request.json();
    await saveProperties(body);

    // Audit Log
    const session = (await cookies()).get('session')?.value;
    const { payload } = await jwtVerify(session!, SECRET_KEY);

    await prisma.auditLog.create({
      data: {
        username: payload.username as string,
        action: 'UPDATE_SETTINGS',
        details: 'Server properties güncellendi'
      }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
