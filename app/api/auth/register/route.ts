import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcılar varsayılan olarak "USER" rolünde ve "ONAYSIZ" başlar.
    // İzinleri boştur.
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'USER',
        isApproved: false, // Yönetici onayı gerekir
        permissions: '[]'  // Hiçbir yetkisi yok
      }
    });

    return NextResponse.json({ success: true, message: 'Kayıt başarılı. Yönetici onayı bekleniyor.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Kayıt işlemi başarısız' }, { status: 500 });
  }
}
