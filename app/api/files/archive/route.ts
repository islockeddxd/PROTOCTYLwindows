import { NextResponse } from 'next/server';
import { createZip } from '@/lib/fileManager';
import { createLog } from '@/lib/logger';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { path: filePath, paths } = body; // Support single 'path' or multiple 'paths'

        const source = paths || filePath;
        if (!source || (Array.isArray(source) && source.length === 0)) {
            return NextResponse.json({ error: 'Path(s) required' }, { status: 400 });
        }

        let targetPath = '';
        if (Array.isArray(source)) {
            // Bulk archive
            // Use parent folder of first item + timestamp or just generic name?
            // Assuming all files are in same dir for now because UI logic usually passes relative paths.
            // We can use the current dir + 'archive-timestamp.zip'.
            // To be safe, UI should pass the desired output path or we generate one.
            // Let's assume we create it in the same folder as the first item.
            const firstItemDir = path.dirname(source[0]);
            targetPath = `${firstItemDir}/archive-${Date.now()}.zip`;
            if (targetPath.startsWith('./')) targetPath = targetPath.substring(2);
        } else {
            targetPath = `${source}.zip`;
        }

        await createZip(source, targetPath);
        await createLog(request, 'FILE_ARCHIVE', `Archived items to ${targetPath}`);

        return NextResponse.json({ success: true, targetPath });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
