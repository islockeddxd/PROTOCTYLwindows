import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const configPath = path.join(process.cwd(), 'public', 'config.json');
        const configData = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configData);

        return NextResponse.json(config, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
            },
        });
    } catch (error) {
        // Return default config if file doesn't exist
        return NextResponse.json({
            appName: 'Panel',
            themeColor: 'blue',
            setupComplete: false,
        });
    }
}
