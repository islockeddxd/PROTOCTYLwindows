import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  // 1. Check for Panel Logo (Uploaded during setup)
  const panelLogoPath = path.join(process.cwd(), 'public', 'logo.png');
  if (fs.existsSync(panelLogoPath)) {
    const imageBuffer = fs.readFileSync(panelLogoPath);
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  }

  // 2. Check for Minecraft Server Icon
  const serverIconPath = path.join(config.serverRoot, 'server-icon.png');
  if (fs.existsSync(serverIconPath)) {
    const imageBuffer = fs.readFileSync(serverIconPath);
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  }

  // 3. Fallback
  return NextResponse.redirect(new URL('/globe.svg', request.url));
}
