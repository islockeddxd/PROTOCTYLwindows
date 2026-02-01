'use client';

import {
    TerminalSquare,
    Files,
    Network,
    Settings,
    PlayCircle,
    Database,
    Users,
    ShieldCheck,
    ClipboardList,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    LogOut,
    CalendarClock
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppConfig } from '@/components/ConfigProvider';

const menuItems = [
    { icon: TerminalSquare, label: 'Konsol', href: '/' },
    { icon: Files, label: 'Dosyalar', href: '/files' },
    { icon: Database, label: 'Yedekler', href: '/backups' },
    { icon: Network, label: 'Network', href: '/network' },
    { icon: PlayCircle, label: 'Başlatma', href: '/startup' },
    { icon: Users, label: 'Kullanıcılar', href: '/admin' },
    { icon: ClipboardList, label: 'Kayıtlar', href: '/admin/logs' },
    { icon: CalendarClock, label: 'Görevler', href: '/schedules' },
    { icon: Settings, label: 'Ayarlar', href: '/settings' },
];

interface User {
    username: string;
    role: string;
    permissions: string[];
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const config = useAppConfig();
    const appName = config.appName;

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setUser(data);
            });
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Don't show sidebar on auth pages
    if (pathname === '/login' || pathname === '/register' || pathname === '/setup') return null;

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-black/50 backdrop-blur border-white/10 text-white hover:bg-white/10"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Content */}
            <motion.div
                className={cn(
                    "fixed md:relative top-0 left-0 h-full z-50 flex flex-col bg-black/80 md:bg-black/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0 w-64" : "-translate-x-full md:w-64",
                    isCollapsed ? "md:w-20" : "md:w-64"
                )}
            >
                {/* Header */}
                <div className={cn("h-16 flex items-center border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-transparent transition-all", isCollapsed ? "justify-center px-0" : "justify-start px-6")}>
                    <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative z-10 w-10 h-10">
                            <img
                                src={`/logo.png?t=${Date.now()}`}
                                alt={appName}
                                width={40}
                                height={40}
                                className="rounded-lg object-contain w-full h-full"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/server-icon.png';
                                }}
                            />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="ml-3 font-bold text-lg text-white tracking-wide whitespace-nowrap overflow-hidden"
                        >
                            {appName}
                        </motion.span>
                    )}
                </div>

                {/* Collapser (Desktop Only) */}
                <div className="hidden md:flex justify-end px-2 py-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="h-6 w-6 text-zinc-500 hover:text-white"
                    >
                        {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                    </Button>
                </div>

                {/* Menu */}
                <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2 px-3 scrollbar-hide">
                    {menuItems.filter(item => {
                        // Admin her şeyi görür
                        if (user?.role === 'admin') return true;

                        // Admin sayfaları sadece admin'e
                        if (item.href === '/admin' || item.href === '/admin/logs') return false;

                        // Granüler yetki kontrolü
                        const requiredPerms: Record<string, string> = {
                            '/': 'console',
                            '/files': 'files',
                            '/backups': 'backups',
                            '/network': 'network',
                            '/startup': 'startup',
                            '/settings': 'settings',
                            '/schedules': 'schedules'
                        };

                        const requiredPerm = requiredPerms[item.href];

                        // Eğer permission haritasında varsa kontrol et, yoksa (örn: çıkış vs) göster
                        if (requiredPerm) {
                            // User permissions string[] içinde yetki var mı?
                            // Not: user.permissions API'den geliyor, string array
                            return user?.permissions?.includes(requiredPerm) ?? false;
                        }

                        return true;
                    }).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-cyan-500/10 text-cyan-400"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5",
                                    isCollapsed ? "justify-center px-2" : ""
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-r-full"
                                    />
                                )}
                                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "animate-pulse")} />

                                {!isCollapsed && (
                                    <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
                                )}

                                {isActive && (
                                    <div className="absolute inset-0 bg-cyan-400/5 blur-md" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <div className={cn("bg-gradient-to-br from-zinc-900 to-black p-3 rounded-lg border border-white/5 flex items-center justify-between gap-3 transition-all group/footer relative overflow-hidden", isCollapsed ? "justify-center p-2" : "")}>

                        {/* User Info */}
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 font-bold text-xs ring-2 ring-indigo-500/10 shrink-0 uppercase">
                                {user?.username ? user.username.substring(0, 2) : 'A'}
                            </div>
                            {!isCollapsed && (
                                <div className="overflow-hidden">
                                    <div className="text-sm text-white font-medium truncate">{user?.username || 'Yükleniyor...'}</div>
                                    <div className="text-xs text-zinc-500 truncate uppercase">{user?.role || '...'}</div>
                                </div>
                            )}
                        </div>

                        {/* Logout Button */}
                        {!isCollapsed && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                title="Çıkış Yap"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
