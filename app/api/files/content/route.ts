import { NextResponse } from 'next/server';
import { readFileContent, saveFileContent, deleteItem } from '@/lib/fileManager';
import { createLog } from '@/lib/logger';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) return NextResponse.json({ error: 'Path required' }, { status: 400 });

  try {
    const content = await readFileContent(path);
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { path, content } = body;

  try {
    await saveFileContent(path, content);
    await createLog(request, 'FILE_SAVE', `Saved/Created file: ${path}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) return NextResponse.json({ error: 'Path required' }, { status: 400 });

  try {
    await deleteItem(path);
    await createLog(request, 'FILE_DELETE', `Deleted file: ${path}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { oldPath, newPath } = body;

  try {
    const { renameItem } = await import('@/lib/fileManager');
    await renameItem(oldPath, newPath);
    await createLog(request, 'FILE_RENAME', `Renamed ${oldPath} to ${newPath}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
