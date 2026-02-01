'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppConfig {
    appName: string;
    themeColor: 'red' | 'blue' | 'orange' | 'white' | 'black';
    setupComplete: boolean;
}

const defaultConfig: AppConfig = {
    appName: 'Panel',
    themeColor: 'blue',
    setupComplete: false,
};

const ConfigContext = createContext<AppConfig>(defaultConfig);

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<AppConfig | null>(null);

    useEffect(() => {
        fetch('/api/config')
            .then((res) => res.json())
            .then((data) => {
                console.log('Config loaded:', data);
                setConfig(data);
            })
            .catch((err) => {
                console.error('Config load error:', err);
                setConfig(defaultConfig);
            });
    }, []);

    // Show loading until config is loaded
    if (!config) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useAppConfig() {
    return useContext(ConfigContext);
}
