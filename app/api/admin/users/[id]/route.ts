import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);

// Helper to check admin role
async function isAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session');
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token.value, SECRET_KEY);
        return payload.role === 'admin';
    } catch {
        return false;
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Correct type for Next.js 15+
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    try {
        const { id } = await params;

        // Prevent deleting self or other admins (optional safety)
        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if target is last admin? For now just allow.

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { isApproved, role, permissions } = body;

        const updateData: any = {};
        if (isApproved !== undefined) updateData.isApproved = isApproved;
        if (role !== undefined) updateData.role = role;
        if (permissions !== undefined) updateData.permissions = JSON.stringify(permissions);

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
