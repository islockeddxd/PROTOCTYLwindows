import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);

// Helper permission check
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

export async function GET(request: Request) {
    if (!(await checkPermission('backups'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

    const backup = await prisma.backup.findUnique({ where: { id } });

    if (!backup || !fs.existsSync(backup.path)) {
        return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 });
    }

    const stat = fs.statSync(backup.path);
    const stream = fs.createReadStream(backup.path);

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${backup.name}"`);
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Length', stat.size.toString());

    // @ts-ignore
    return new NextResponse(stream, { headers });
}
