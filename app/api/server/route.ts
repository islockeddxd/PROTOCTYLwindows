import { NextResponse } from 'next/server';
import { serverManager } from '@/lib/serverManager';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';
import { createLog } from '@/lib/logger';

const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);

async function checkPermission(perm: string, req?: Request) {
  // Internal Scheduler Bypass
  if (req && req.headers.get('x-scheduler-secret') === config.jwtSecret) return true;

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
  if (!(await checkPermission('console'))) {
    // Allow GET status but maybe minimal? Or just block?
    // For dashboard status bar, we might want to allow basic status.
    // But typically requires login.
    // Let's require at least valid session.
    const session = (await cookies()).get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = serverManager.getStatus();
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, command } = body;

  switch (action) {
    case 'start':
      if (!(await checkPermission('start', request))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
      serverManager.start();
      await createLog(request, 'SERVER_START', 'Initiated server startup');
      return NextResponse.json({ message: 'Server starting...' });
    case 'stop':
      if (!(await checkPermission('stop', request))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
      serverManager.stop();
      await createLog(request, 'SERVER_STOP', 'Initiated server shutdown');
      return NextResponse.json({ message: 'Stop command sent.' });
    case 'kill':
      if (!(await checkPermission('stop', request))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
      serverManager.kill();
      await createLog(request, 'SERVER_KILL', 'Forced server kill');
      return NextResponse.json({ message: 'Server killed.' });
    case 'command':
      if (!(await checkPermission('console', request))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
      if (command) {
        serverManager.sendCommand(command);
        await createLog(request, 'SERVER_COMMAND', `Executed: ${command}`);
      }
      return NextResponse.json({ message: 'Command sent.' });
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
