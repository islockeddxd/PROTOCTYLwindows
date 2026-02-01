import { NextResponse } from 'next/server';
import { saveFileBuffer, extractZip } from '@/lib/fileManager';
import { createLog } from '@/lib/logger';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const path = formData.get('path') as string || '';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path ? `${path}/${file.name}` : file.name;

        await saveFileBuffer(filePath, buffer);
        await createLog(request, 'FILE_UPLOAD', `Uploaded file: ${filePath}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
