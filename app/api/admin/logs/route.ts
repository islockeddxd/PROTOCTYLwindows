import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';

const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);

export async function GET(request: Request) {
    try {
        const session = (await cookies()).get('session')?.value;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { payload } = await jwtVerify(session, SECRET_KEY);
        if (payload.role !== 'admin') {
            return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
        }

        const logs = await prisma.auditLog.findMany({
            orderBy: {
                timestamp: 'desc'
            },
            take: 100
        });
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
