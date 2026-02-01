import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '@/lib/config';

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Hatalı kullanıcı adı veya şifre' }, { status: 401 });
    }

    if (!user.isApproved) {
      return NextResponse.json({ error: 'Hesabınız henüz onaylanmadı. Yönetici onayı bekleniyor.' }, { status: 403 });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        username: user.username,
        action: 'LOGIN',
        details: 'Başarılı giriş yapıldı'
      }
    });

    const token = await new SignJWT({
      username: user.username,
      role: user.role,
      permissions: JSON.parse(user.permissions)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(SECRET_KEY);

    (await cookies()).set('session', token, {
      httpOnly: true,
      secure: false, // HTTP üzerinden de girişe izin ver (Cloudflare/Localhost için)
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax'
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}