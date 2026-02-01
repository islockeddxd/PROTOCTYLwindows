import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const schedules = await prisma.schedule.findMany({
            include: { tasks: true },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(schedules);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, cron } = await request.json();
        const schedule = await prisma.schedule.create({
            data: { name, cron, isActive: true },
        });
        return NextResponse.json(schedule);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}
