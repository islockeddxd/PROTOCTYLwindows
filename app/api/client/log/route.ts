import { NextResponse } from 'next/server';
import { createLog } from '@/lib/logger';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, details } = body;

        await createLog(request, action, details);

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
