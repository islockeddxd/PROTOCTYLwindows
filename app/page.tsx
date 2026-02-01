'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Console from '@/components/dashboard/Console';
import ResourceGraph from '@/components/dashboard/ResourceGraph';
import { Play, Square, Radio, Server, HardDrive, TerminalSquare, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import clsx from 'clsx';
import { useAppConfig } from '@/components/ConfigProvider';
import { getTheme, ThemeColor } from '@/lib/themes';

export default function Dashboard() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState({ running: false });
  const config = useAppConfig();
  const theme = getTheme(config.themeColor as ThemeColor);
  const appName = config.appName || 'Server';

  // Mock data for graphs
  const [cpuData, setCpuData] = useState<any[]>([]);
  const [ramData, setRamData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (document.hidden) return;

      try {
        const res = await fetch('/api/server');
        if (res.ok) {
          const data = await res.json();
          setStatus({ running: data.running });
          if (data.logs.length !== logs.length) setLogs(data.logs);

          const now = new Date().toLocaleTimeString();
          setCpuData(prev => [...prev.slice(-20), { time: now, usage: Math.floor(Math.random() * 30) + 10 }]);
          setRamData(prev => [...prev.slice(-20), { time: now, usage: Math.floor(Math.random() * 5) + 2 }]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const interval = setInterval(fetchStatus, 2000);
    fetchStatus();
    return () => clearInterval(interval);
  }, [logs]);

  const sendAction = async (action: string) => {
    setLoading(true);
    try {
      await fetch('/api/server', { method: 'POST', body: JSON.stringify({ action }) });
    } finally {
      setLoading(false);
    }
  };

  const sendCommand = async (cmd: string) => {
    await fetch('/api/server', {
      method: 'POST',
      body: JSON.stringify({ action: 'command', command: cmd }),
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border shadow-2xl backdrop-blur-md ${theme.classes.bgSecondary} bg-opacity-40 ${theme.classes.border}`}
      >
        <div>
          <h2 className={`text-3xl font-bold mb-2 flex items-center gap-3 ${theme.classes.text}`}>
            <Server className={`w-8 h-8 ${theme.classes.textAccent}`} />
            {appName}
          </h2>
          <div className="flex items-center gap-3">
            <div className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-colors duration-500",
              status.running
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              <div className={clsx("w-2 h-2 rounded-full animate-pulse", status.running ? "bg-emerald-400" : "bg-red-400")} />
              {status.running ? 'ONLINE' : 'OFFLINE'}
            </div>
            <span className={`${theme.classes.textSecondary} text-sm font-mono`}>1.21.1 Paper</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => sendAction('start')}
            disabled={status.running || loading}
            className={`font-bold px-6 shadow-lg transition-all hover:scale-105 ${status.running ? 'opacity-50 cursor-not-allowed bg-zinc-700' : `${theme.classes.bgPrimary} text-white shadow-emerald-900/20`}`}
          >
            <Play className="w-4 h-4 mr-2" /> Başlat
          </Button>

          <Button
            onClick={() => sendAction('stop')}
            disabled={!status.running || loading}
            className={`font-bold px-6 shadow-lg transition-all hover:scale-105 ${!status.running ? 'opacity-50 cursor-not-allowed bg-zinc-700' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'}`}
          >
            <Square className="w-4 h-4 mr-2 fill-current" /> Durdur
          </Button>

          <Button
            onClick={() => sendAction('kill')}
            variant="outline"
            className="border-red-900/50 text-red-500 hover:bg-red-950/30 hover:text-red-400"
            title="Zorla Kapat"
          >
            <Radio className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Live Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ResourceGraph
          title="CPU Kullanımı"
          data={cpuData}
          dataKey="usage"
          unit="%"
          color={config.themeColor === 'red' ? '#ef4444' : config.themeColor === 'orange' ? '#f97316' : '#8b5cf6'}
        />
        <ResourceGraph
          title="RAM Kullanımı"
          data={ramData}
          dataKey="usage"
          unit=" GB"
          color={config.themeColor === 'red' ? '#f87171' : config.themeColor === 'orange' ? '#fb923c' : '#06b6d4'}
        />

        <Card className={`backdrop-blur-md border p-6 flex flex-col justify-center gap-2 relative overflow-hidden group ${theme.classes.bgSecondary} bg-opacity-40 ${theme.classes.border}`}>
          <h3 className={`text-xs font-medium uppercase tracking-widest ${theme.classes.textSecondary}`}>Disk</h3>
          <div className={`text-3xl font-bold ${theme.classes.text}`}>45 GB <span className={`text-lg font-normal ${theme.classes.textSecondary}`}>/ 120 GB</span></div>
          <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className={`h-full w-[35%] ${theme.classes.bgGradient}`} />
          </div>
          <div className={`absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity ${theme.classes.bgPrimary}`} />
          <HardDrive className={`absolute bottom-6 right-6 w-8 h-8 opacity-20 ${theme.classes.text}`} />
        </Card>
      </div>

      {/* Console Area */}
      <div className="flex-1 min-h-[600px] relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <Card className={`h-full flex flex-col overflow-hidden shadow-2xl rounded-xl border ${theme.classes.border} bg-black`}>
          {/* Terminal Header */}
          <div className="h-10 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between px-4 select-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
            </div>
            <div className={`text-xs font-mono flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/5 ${theme.classes.textSecondary}`}>
              <TerminalSquare className="w-3 h-3" />
              root@{appName.toLowerCase().replace(/\s+/g, '-')}:~/server
            </div>
            <Activity className={`w-4 h-4 animate-pulse ${theme.classes.textAccent}`} />
          </div>

          <div className="flex-1 p-0 relative bg-black/40">
            <Console logs={logs} onCommand={sendCommand} />
          </div>
        </Card>
      </div>
    </div>
  );
}
