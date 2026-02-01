'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/dashboard/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Eğer giriş/kayıt sayfasıysak, layout sarmalaması yapma, direkt sayfayı göster.
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar & MobileNav */}
      <MobileNav />
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-6 relative w-full">
        {children}
      </main>
    </div>
  );
}