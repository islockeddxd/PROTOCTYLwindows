import fs from 'fs';
import path from 'path';

export interface AppConfig {
    // Application
    appName: string;
    appUrl: string;
    themeColor: string;

    // Security
    jwtSecret: string;

    // Server
    serverRoot: string;
    javaPath: string;

    // Database
    databaseUrl: string;

    // Setup
    isSetupComplete: boolean;
}

function parseEnvFile() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) return {};
        const content = fs.readFileSync(envPath, 'utf-8');
        const env: Record<string, string> = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let value = match[2].trim();
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[match[1].trim()] = value;
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

function getConfig(): AppConfig {
    // Manually parse .env to get fresh values (essential for Setup Wizard)
    const env = parseEnvFile();

    // Priority: .env file > process.env > defaults
    const getVal = (key: string, defaultVal: string) => env[key] || process.env[key] || defaultVal;

    return {
        appName: getVal('APP_NAME', 'Atherise Panel'),
        appUrl: getVal('APP_URL', 'http://localhost:3000'),
        themeColor: getVal('THEME_COLOR', 'blue'),
        jwtSecret: getVal('JWT_SECRET', 'super-secret-key-change-this-later'),

        // Edge Runtime fix: path module handled via string concat for defaults
        // But here we rely on the parsed value mostly.
        serverRoot: getVal('SERVER_ROOT', (typeof process.cwd === 'function' ? process.cwd() : '.') + '/server'),
        javaPath: getVal('JAVA_PATH', 'java'),

        databaseUrl: getVal('DATABASE_URL', 'file:./dev.db'),
        isSetupComplete: getVal('SETUP_COMPLETE', 'false') === 'true',
    };
}

export const config = {
    get appName() { return getConfig().appName },
    get appUrl() { return getConfig().appUrl },
    get themeColor() { return getConfig().themeColor },
    get jwtSecret() { return getConfig().jwtSecret },
    get serverRoot() { return getConfig().serverRoot },
    get javaPath() { return getConfig().javaPath },
    get databaseUrl() { return getConfig().databaseUrl },
    get isSetupComplete() { return getConfig().isSetupComplete },
};
