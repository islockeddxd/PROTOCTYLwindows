import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { action, payload, delay } = await request.json();

        const task = await prisma.scheduleTask.create({
            data: {
                scheduleId: id,
                action,
                payload,
                delay: Number(delay) || 0,
                sequence: Date.now() // simple sort
            }
        });

        return NextResponse.json(task);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
) {
    // Since checking params here is complex for nested route, usually we use unique ID for task deletion.
    // But this route is api/schedules/[id]/tasks.
    // If we want to delete a task, we should use api/schedules/tasks/[taskId] or pass ID in body.
    // Let's assume we pass ID in body for simplicity or use a separate route.
    // Actually easier: api/schedules/tasks/[taskId]/route.ts.
    return NextResponse.json({ error: 'Use specific task route' }, { status: 405 });
}
