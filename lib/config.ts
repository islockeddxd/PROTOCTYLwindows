export interface AppConfig {
    // Application
    appName: string;
    appUrl: string;
    themeColor: string;

    // Security
    jwtSecret: string;

    // Server
    serverRoot: string;

    // Database
    databaseUrl: string;

    // Setup
    isSetupComplete: boolean;
}

import path from 'path';

function getConfig(): AppConfig {
    return {
        appName: process.env.APP_NAME || 'Atherise Panel',
        appUrl: process.env.APP_URL || 'http://localhost:3000',
        themeColor: process.env.THEME_COLOR || 'blue',
        jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-this-later',
        serverRoot: process.env.SERVER_ROOT || path.join(process.cwd(), 'server'),
        databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
        isSetupComplete: process.env.SETUP_COMPLETE === 'true',
    };
}

export const config = getConfig();
