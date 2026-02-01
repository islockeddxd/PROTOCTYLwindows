'use client';

import { useAppConfig } from './ConfigProvider';
import { getTheme } from '@/lib/themes';

export default function ThemeBackground() {
    const config = useAppConfig();
    const theme = getTheme(config.themeColor);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${theme.classes.bgPrimary}`} />
            <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${theme.classes.bgSecondary}`} />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>
    );
}
