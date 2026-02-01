import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/dashboard/Sidebar";
import { config } from "@/lib/config";
import { ConfigProvider } from "@/components/ConfigProvider";
import ThemeBackground from "@/components/ThemeBackground";
import PageLogger from "@/components/PageLogger";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: config.appName || "Panel",
  description: "Advanced Server Management",
  icons: {
    icon: "/api/server/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider>
          <div className="flex bg-[#050505] min-h-screen text-white overflow-hidden selection:bg-cyan-500/30">

            {/* Global Background */}
            <ThemeBackground />
            <PageLogger />

            <Sidebar />

            <main className="flex-1 relative z-10 overflow-y-auto h-screen scrollbar-hide">
              <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </ConfigProvider>
      </body>
    </html>
  );
}