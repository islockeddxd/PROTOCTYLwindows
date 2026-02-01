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

function getConfig(): AppConfig {
    return {
        appName: process.env.APP_NAME || 'Atherise Panel',
        appUrl: process.env.APP_URL || 'http://localhost:3000',
        themeColor: process.env.THEME_COLOR || 'blue',
        jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-this-later',
        // Edge Runtime fix: path module is not supported. Use string concatenation.
        serverRoot: process.env.SERVER_ROOT || ((typeof process.cwd === 'function' ? process.cwd() : '.') + '/server'),
        databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
        isSetupComplete: process.env.SETUP_COMPLETE === 'true',
    };
}

export const config = getConfig();
