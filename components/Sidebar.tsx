'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FolderOpen,
  Settings,
  TerminalSquare,
  Globe,
  LogOut,
  ShieldAlert,
  Server,
  X,
  Archive,
  Cpu // Startup icon
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Konsol', href: '/', icon: TerminalSquare, permission: 'console' },
  { name: 'Dosya Yöneticisi', href: '/files', icon: FolderOpen, permission: 'files' },
  { name: 'Yedeklemeler', href: '/backups', icon: Archive, permission: 'files' },
  { name: 'Ağ Ayarları', href: '/network', icon: Globe, permission: 'settings' },
  { name: 'Başlatma Ayarları', href: '/startup', icon: Cpu, permission: 'settings' }, // Yeni eklendi
  { name: 'Ayarlar', href: '/settings', icon: Settings, permission: 'settings' },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [serverIcon, setServerIcon] = useState<string | null>(null);

  const [user, setUser] = useState<{ role: string, permissions: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Unauthorized');
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });

    fetch('/api/server/icon')
      .then(res => {
        if (res.ok) setServerIcon('/api/server/icon');
      })
      .catch(() => { });
  }, []);

  const handleLogout = () => {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push('/login');
  };

  const hasPermission = (requiredPerm?: string) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (!requiredPerm) return true;
    return user.permissions.includes(requiredPerm);
  };

  // NOT: Pathname kontrolü artık AppLayout içinde yapılıyor.

  if (loading) return <div className="w-72 h-screen bg-[#0f172a] border-r border-white/5 animate-pulse" />;
  if (!user) return null;

  return (
    <div className={clsx(
      "flex flex-col bg-[#0f172a] border-r border-white/5 h-full relative",
      mobile ? "w-full shadow-none" : "w-72 shadow-2xl"
    )}>
      {mobile && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg shrink-0">
            {serverIcon ? (
              <img src={serverIcon} alt="Server Icon" className="w-full h-full object-cover" />
            ) : (
              <Server className="w-6 h-6 text-cyan-400" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{config.appName}</h1>
            <p className="text-xs text-slate-400 font-medium">Yönetim Paneli</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sunucu Kontrolü</p>

        {navItems.map((item) => {
          if (!hasPermission(item.permission)) return null;

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              )}
            >
              <item.icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}

        {user.role === 'ADMIN' && (
          <>
            <div className="mt-8 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Yönetim</div>
            <Link
              href="/admin"
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                pathname === '/admin'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              )}
            >
              <ShieldAlert className="w-5 h-5" />
              <span className="font-medium text-sm">Admin Paneli</span>
            </Link>
          </>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors group border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}
