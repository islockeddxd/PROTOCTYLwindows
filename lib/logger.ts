import { prisma } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';

const SECRET_KEY = new TextEncoder().encode(config.jwtSecret);

export async function createLog(request: Request, action: string, details?: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;

        let username = 'Anonymous';

        // Attempt to parse IP
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'Unknown';

        if (token) {
            try {
                const { payload } = await jwtVerify(token, SECRET_KEY);
                if (payload.username) {
                    username = payload.username as string;
                }
            } catch (e) {
                // Token invalid or expired, continue as Anonymous
            }
        }

        await prisma.auditLog.create({
            data: {
                username,
                action,
                details,
                ipAddress
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't crash the request if logging fails
    }
}
