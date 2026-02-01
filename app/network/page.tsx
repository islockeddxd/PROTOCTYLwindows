'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Plus, Trash2, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

import { useRouter } from 'next/navigation';

// Simulated list since we don't have DB for allocations yet
interface Allocation {
    id: number;
    port: string;
    note: string;
}

export default function NetworkPage() {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [port, setPort] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check permission explicitly since there's no initial fetch
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(user => {
                if (user.role !== 'admin' && !user.permissions?.includes('network')) {
                    router.push('/');
                }
            });
    }, []);

    const handleCreate = async () => {
        if (!port) return;
        setLoading(true);

        const res = await fetch('/api/server/network', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ port, description: note })
        });

        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Port Açıldı', text: `${port} numaralı port Windows Güvenlik Duvarı'nda açıldı.`, background: '#0f172a', color: '#fff' });
            setAllocations([...allocations, { id: Date.now(), port, note }]);
            setPort('');
            setNote('');
        } else {
            Swal.fire({ icon: 'error', title: 'Hata', text: 'Port açılamadı (Yetki sorunu olabilir).', background: '#0f172a', color: '#fff' });
        }
        setLoading(false);
    };

    const handleDelete = async (allocation: Allocation) => {
        if (!confirm(`Port ${allocation.port} kapatılsın mı?`)) return;

        await fetch('/api/server/network', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ port: allocation.port })
        });

        setAllocations(allocations.filter(a => a.id !== allocation.id));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Globe className="text-cyan-400" /> Ağ Yönetimi
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Sunucu için ek portlar açın (Pluginler, Dynmap vb. için).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Allocation */}
                <Card className="bg-[#0f172a] border-white/5 h-fit">
                    <CardHeader>
                        <CardTitle>Port Tahsis Et</CardTitle>
                        <CardDescription>Yeni bir portu dış dünyaya açın.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Port Numarası</Label>
                            <Input
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                placeholder="Örn: 8123"
                                className="bg-black/30 border-white/10"
                                type="number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Not (Opsiyonel)</Label>
                            <Input
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Örn: Dynmap"
                                className="bg-black/30 border-white/10"
                            />
                        </div>
                        <Button
                            onClick={handleCreate}
                            disabled={loading || !port}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {loading ? 'İşleniyor...' : 'Oluştur'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Allocation List */}
                <Card className="bg-[#0f172a] border-white/5 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Açık Portlar</CardTitle>
                        <CardDescription>Şu an panel tarafından yönetilen portlar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {/* Primary Port (Always there) */}
                            <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                                    <div>
                                        <div className="text-white font-mono font-bold">25565 (Varsayılan)</div>
                                        <div className="text-xs text-cyan-300">Ana Sunucu Portu</div>
                                    </div>
                                </div>
                                <div className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded font-bold">BİRİNCİL</div>
                            </div>

                            {allocations.map(alloc => (
                                <div key={alloc.id} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-slate-500" />
                                        <div>
                                            <div className="text-white font-mono font-bold">{alloc.port}</div>
                                            <div className="text-xs text-slate-500">{alloc.note || 'Not yok'}</div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDelete(alloc)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            {allocations.length === 0 && (
                                <div className="text-center p-6 text-slate-500 text-sm">
                                    Ekstra açılmış port yok.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
