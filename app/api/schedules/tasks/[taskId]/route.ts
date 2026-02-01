import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
    request: Request,
    context: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await context.params;
        await prisma.scheduleTask.delete({ where: { id: taskId } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
