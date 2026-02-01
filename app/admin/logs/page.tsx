'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Search } from 'lucide-react';

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/logs');
            if (res.status === 403) {
                window.location.href = '/'; // Direct browser redirection for safety
                return;
            }
            const data = await res.json();
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.username.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Denetim Kayıtları</h1>
                    <p className="text-zinc-400 mt-1">Sistem üzerindeki kullanıcı hareketlerini izleyin.</p>
                </div>
                <Button onClick={fetchLogs} variant="outline" className="border-white/10 hover:bg-white/5">
                    <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Yenile
                </Button>
            </div>

            <Card className="bg-[#09090b] border-white/5 p-4">
                <div className="mb-4 relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Kullanıcı, eylem veya detay ara..."
                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-zinc-500">
                                <th className="p-3 font-medium">Zaman</th>
                                <th className="p-3 font-medium">Kullanıcı</th>
                                <th className="p-3 font-medium">Eylem</th>
                                <th className="p-3 font-medium">Detay</th>
                                <th className="p-3 font-medium">IP Adresi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="p-3 text-zinc-400 font-mono text-xs">
                                        {new Date(log.timestamp).toLocaleString('tr-TR')}
                                    </td>
                                    <td className="p-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                                            {log.username}
                                        </span>
                                    </td>
                                    <td className="p-3 text-zinc-300 font-medium">{log.action}</td>
                                    <td className="p-3 text-zinc-400 max-w-md truncate" title={log.details}>
                                        {log.details || '-'}
                                    </td>
                                    <td className="p-3 text-zinc-500 font-mono text-xs">{log.ipAddress || 'Unknown'}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                                        Kayıt bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
