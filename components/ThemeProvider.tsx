'use client';

import { createContext, useContext, ReactNode } from 'react';
import { ThemeColor, getTheme, Theme } from '@/lib/themes';

interface ThemeContextType {
    theme: Theme;
    themeColor: ThemeColor;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
    children,
    themeColor = 'blue'
}: {
    children: ReactNode;
    themeColor?: ThemeColor;
}) {
    const theme = getTheme(themeColor);

    return (
        <ThemeContext.Provider value={{ theme, themeColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
