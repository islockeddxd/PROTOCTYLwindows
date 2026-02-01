import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // As of Next.js 15+, params is a Promise
) {
    try {
        const { id } = await params;
        await prisma.schedule.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const updated = await prisma.schedule.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
