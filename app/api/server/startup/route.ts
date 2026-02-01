import {
  NextResponse
} from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);
import { config } from '@/lib/config';

// Start.bat artık serverRoot içinde aranacak
const START_BAT_PATH = path.join(config.serverRoot, 'start.bat');

async function checkPermission(perm: string) {
  const session = (await cookies()).get('session')?.value;
  if (!session) return false;
  try {
    const { payload } = await jwtVerify(session, SECRET_KEY);
    const userPerms = (payload.permissions as string[]) || [];
    const userRole = (payload.role as string || '').toLowerCase();
    return userRole === 'admin' || userPerms.includes(perm) || userPerms.includes('settings');
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await checkPermission('startup'))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  try {
    const content = await fs.readFile(START_BAT_PATH, 'utf-8');

    // Regex ile RAM değerlerini bul
    const xmxMatch = content.match(/-Xmx(\d+[GMK])/);
    const xmsMatch = content.match(/-Xms(\d+[GMK])/);

    // Java args (komutun geri kalanı)
    const javaCmd = content.trim();

    return NextResponse.json({
      content: javaCmd,
      ram: xmxMatch ? xmxMatch[1] : 'Unknown',
      startRam: xmsMatch ? xmsMatch[1] : 'Unknown'
    });
  } catch (e) {
    return NextResponse.json({ error: 'start.bat okunamadı' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkPermission('startup'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

  try {
    const body = await request.json();
    const { ram } = body; // Örn: "12G"

    let content = await fs.readFile(START_BAT_PATH, 'utf-8');

    // Basit replace: -Xmx... -> -XmxNEW
    // Hem Xmx hem Xms'i eşitliyoruz (Optimize performans için genelde önerilir)
    content = content.replace(/-Xmx(\d+[GMK])/, `-Xmx${ram}`);
    content = content.replace(/-Xms(\d+[GMK])/, `-Xms${ram}`);

    await fs.writeFile(START_BAT_PATH, content, 'utf-8');

    // Log
    const session = (await cookies()).get('session')?.value;
    const { payload } = await jwtVerify(session!, SECRET_KEY);
    await prisma.auditLog.create({
      data: {
        username: payload.username as string,
        action: 'UPDATE_STARTUP',
        details: `RAM güncellendi: ${ram}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Kaydedilemedi' }, { status: 500 });
  }
}
