import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);

const SERVER_DIR = config.serverRoot;
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Helper permission check
async function checkPermission(perm: string) {
  const session = (await cookies()).get('session')?.value;
  if (!session) return false;
  try {
    const { payload } = await jwtVerify(session, SECRET_KEY);
    const userPerms = (payload.permissions as string[]) || [];
    return payload.role === 'admin' || userPerms.includes(perm);
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await checkPermission('backups'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

  try {
    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(backups);
  } catch (e) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST() {
  const startTime = Date.now();
  console.log('[BACKUP] Starting request...');

  if (!(await checkPermission('backups'))) {
    console.log('[BACKUP] Access denied');
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
  }

  if (!fs.existsSync(SERVER_DIR)) {
    console.log('[BACKUP] Server dir not found:', SERVER_DIR);
    return NextResponse.json({ error: 'Sunucu klasörü bulunamadı: ' + SERVER_DIR }, { status: 404 });
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
  const fileName = `Backup-${dateStr}.zip`;
  const filePath = path.join(BACKUP_DIR, fileName);
  const output = fs.createWriteStream(filePath);

  // Use STORE (Level 0) for maximum speed and least CPU usage correctly, 
  // or Level 1 for slight compression. User wants speed/fix.
  const archive = archiver('zip', {
    zlib: { level: 1 }
  });

  console.log(`[BACKUP] Streaming to: ${filePath}`);

  return new Promise<NextResponse>((resolve) => {
    // 1. Success Handler
    output.on('close', async () => {
      const duration = (Date.now() - startTime) / 1000;
      console.log(`[BACKUP] Finished in ${duration}s. Size: ${archive.pointer()} bytes`);

      const sizeBytes = archive.pointer();
      const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2) + ' MB';

      try {
        const backup = await prisma.backup.create({
          data: {
            name: fileName,
            path: filePath,
            size: sizeMB
          }
        });
        resolve(NextResponse.json(backup));
      } catch (dbError) {
        console.error('[BACKUP] Database save failed:', dbError);
        resolve(NextResponse.json({ error: 'Backup created but DB record failed' }, { status: 500 }));
      }
    });

    // 2. Error Handler
    archive.on('error', (err) => {
      console.error('[BACKUP] Archiver fatal error:', err);
      // Try to close stream and return error
      resolve(NextResponse.json({ error: 'Backup process crashed: ' + err.message }, { status: 500 }));
    });

    // 3. Warnings (Non-fatal)
    archive.on('warning', (err) => {
      console.warn('[BACKUP] Warning:', err.code, err.message);
    });

    // 4. Progress (Debug)
    archive.on('progress', (p) => {
      if (p.entries.processed % 50 === 0) {
        console.log(`[BACKUP] Processed ${p.entries.processed} files...`);
      }
    });

    archive.pipe(output);

    // 5. Add Files
    console.log('[BACKUP] Adding glob pattern...');

    try {
      archive.glob('**/*', {
        cwd: SERVER_DIR,
        ignore: [
          'backups/**',
          'node_modules/**',
          '.next/**',
          '.git/**',
          '*.log',        // Skip logs
          '*.lock',       // Skip lock files (IMPORTANT for Windows)
          'cache/**',
          'libraries/**',
          'versions/**',
          'web/**'
        ],
        dot: true,
        nodir: false
      });

      archive.finalize().then(() => {
        console.log('[BACKUP] Finalize called.');
      });
    } catch (globError) {
      console.error('[BACKUP] Glob error:', globError);
      resolve(NextResponse.json({ error: 'Failed to start file search' }, { status: 500 }));
    }
  });
}

export async function DELETE(request: Request) {
  if (!(await checkPermission('backups'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

  try {
    const backup = await prisma.backup.findUnique({ where: { id } });
    if (backup) {
      if (fs.existsSync(backup.path)) {
        try {
          fs.unlinkSync(backup.path);
        } catch (ignore) {
          console.error('Delete file error (ignored):', ignore);
        }
      }
      await prisma.backup.delete({ where: { id } });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
