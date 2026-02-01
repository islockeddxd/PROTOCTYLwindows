export type ThemeColor = 'red' | 'blue' | 'orange' | 'white' | 'black';

export interface Theme {
    name: string;
    classes: {
        // Backgrounds
        bgPrimary: string;
        bgSecondary: string;
        bgGradient: string;

        // Text
        text: string;
        textSecondary: string;
        textAccent: string;

        // Borders
        border: string;
        borderAccent: string;

        // Effects
        glow: string;
        shadow: string;
    };
}

export const themes: Record<ThemeColor, Theme> = {
    red: {
        name: 'Red',
        classes: {
            bgPrimary: 'bg-red-600 hover:bg-red-700',
            bgSecondary: 'bg-zinc-900',
            bgGradient: 'bg-gradient-to-r from-red-600 to-red-500',
            text: 'text-white',
            textSecondary: 'text-zinc-400',
            textAccent: 'text-red-400',
            border: 'border-red-600/20',
            borderAccent: 'border-red-500',
            glow: 'bg-red-600/20',
            shadow: 'shadow-red-500/20',
        },
    },
    blue: {
        name: 'Blue',
        classes: {
            bgPrimary: 'bg-blue-600 hover:bg-blue-700',
            bgSecondary: 'bg-zinc-900',
            bgGradient: 'bg-gradient-to-r from-blue-600 to-blue-500',
            text: 'text-white',
            textSecondary: 'text-zinc-400',
            textAccent: 'text-blue-400',
            border: 'border-blue-600/20',
            borderAccent: 'border-blue-500',
            glow: 'bg-blue-600/20',
            shadow: 'shadow-blue-500/20',
        },
    },
    orange: {
        name: 'Orange',
        classes: {
            bgPrimary: 'bg-orange-600 hover:bg-orange-700',
            bgSecondary: 'bg-zinc-900',
            bgGradient: 'bg-gradient-to-r from-orange-600 to-orange-500',
            text: 'text-white',
            textSecondary: 'text-zinc-400',
            textAccent: 'text-orange-400',
            border: 'border-orange-600/20',
            borderAccent: 'border-orange-500',
            glow: 'bg-orange-600/20',
            shadow: 'shadow-orange-500/20',
        },
    },
    white: {
        name: 'White',
        classes: {
            bgPrimary: 'bg-zinc-100 hover:bg-zinc-200',
            bgSecondary: 'bg-zinc-50',
            bgGradient: 'bg-gradient-to-r from-zinc-100 to-zinc-200',
            text: 'text-zinc-900',
            textSecondary: 'text-zinc-600',
            textAccent: 'text-zinc-700',
            border: 'border-zinc-300',
            borderAccent: 'border-zinc-400',
            glow: 'bg-zinc-200/50',
            shadow: 'shadow-zinc-400/20',
        },
    },
    black: {
        name: 'Black',
        classes: {
            bgPrimary: 'bg-zinc-800 hover:bg-zinc-900',
            bgSecondary: 'bg-zinc-950',
            bgGradient: 'bg-gradient-to-r from-zinc-800 to-zinc-700',
            text: 'text-white',
            textSecondary: 'text-zinc-400',
            textAccent: 'text-zinc-300',
            border: 'border-zinc-800/20',
            borderAccent: 'border-zinc-700',
            glow: 'bg-zinc-800/20',
            shadow: 'shadow-zinc-700/20',
        },
    },
};

export function getTheme(color: ThemeColor): Theme {
    return themes[color] || themes.blue;
}
