'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageLogger() {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname) return;

        // Debounce or filter?
        // simple fetch
        const pageName = pathname === '/' ? 'Console' : pathname.replace('/', '');

        fetch('/api/client/log', {
            method: 'POST',
            body: JSON.stringify({
                action: 'PAGE_VIEW',
                details: `Visited ${pageName}`
            })
        }).catch(() => { });

    }, [pathname]);

    return null;
}
