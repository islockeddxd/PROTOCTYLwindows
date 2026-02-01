import { NextResponse } from 'next/server';
import { listFiles, createFolder } from '@/lib/fileManager';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';

  try {
    const files = await listFiles(path);
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { path } = body;

  try {
    await createFolder(path);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
