import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  import { config } from '@/lib/config';

  export async function GET() {
    const iconPath = path.join(config.serverRoot, 'server-icon.png');

    if (fs.existsSync(iconPath)) {
      const imageBuffer = fs.readFileSync(iconPath);
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } else {
      // Return a default SVG placeholder or 404
      return new NextResponse(null, { status: 404 });
    }
  }
