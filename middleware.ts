import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-change-this-later');

function isSetupComplete(): boolean {
  return process.env.SETUP_COMPLETE === 'true';
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Check if setup is complete
  const setupComplete = isSetupComplete();

  // If setup not complete, only allow /setup and /api/setup
  if (!setupComplete) {
    if (pathname === '/setup' || pathname.startsWith('/api/setup') || pathname.startsWith('/_next')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/setup', request.url));
  }

  // If setup complete, block /setup access
  if (pathname === '/setup' || pathname.startsWith('/api/setup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow login, register pages and public assets/static files
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    /\.(png|jpg|jpeg|svg|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check auth
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(session, SECRET_KEY);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
