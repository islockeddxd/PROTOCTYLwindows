import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  const iconPath = path.join(config.serverRoot, 'server-icon.png');

  if (fs.existsSync(iconPath)) {
    const imageBuffer = fs.readFileSync(iconPath);
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, must-revalidate' // Prevent aggressive caching during changes
      }
    });
  } else {
    // Fallback to default public icon
    return NextResponse.redirect(new URL('/globe.svg', request.url));
  }
}
