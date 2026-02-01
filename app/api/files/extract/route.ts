import { NextResponse } from 'next/server';
import { extractZip } from '@/lib/fileManager';
import { createLog } from '@/lib/logger';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { path: filePath } = await request.json();
        if (!filePath) return NextResponse.json({ error: 'Path required' }, { status: 400 });

        const parentDir = path.dirname(filePath);
        await extractZip(filePath, parentDir);
        await createLog(request, 'FILE_EXTRACT', `Extracted: ${filePath}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
