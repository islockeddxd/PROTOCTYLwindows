'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Plus, Trash2, Play, Clock, Power, TerminalSquare, Save, X, Archive, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Swal from 'sweetalert2';
import { useAppConfig } from '@/components/ConfigProvider';
import { getTheme, ThemeColor } from '@/lib/themes';
import clsx from 'clsx';

interface Task {
    id: string;
    action: string;
    payload: string;
    delay: number;
}

interface Schedule {
    id: string;
    name: string;
    cron: string;
    isActive: boolean;
    lastRun: string | null;
    nextRun: string | null;
    tasks: Task[];
}

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const config = useAppConfig();
    const theme = getTheme(config.themeColor as ThemeColor);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const res = await fetch('/api/schedules');
            if (res.ok) setSchedules(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Yeni Zamanlanmış Görev',
            html: `
        <input id="swal-name" class="swal2-input" placeholder="Görev Adı (örn: Otomatik Yedek)" style="margin-bottom: 10px;">
        <select id="swal-cron-select" class="swal2-input" style="background: #333; color: white;" onchange="
          const val = this.value;
          const custom = document.getElementById('swal-cron-custom');
          if(val === 'custom') custom.style.display = 'block';
          else custom.style.display = 'none';
        ">
          <option value="" disabled selected>Ne Sıklıkla Çalışsın?</option>
          <option value="*/5 * * * *">Her 5 Dakikada Bir</option>
          <option value="*/30 * * * *">Her 30 Dakikada Bir</option>
          <option value="0 * * * *">Her Saat Başı</option>
          <option value="0 0 * * *">Her Gün (Gece 00:00)</option>
          <option value="0 12 * * *">Her Gün (Öğlen 12:00)</option>
          <option value="0 0 * * 0">Her Pazar (Haftalık)</option>
          <option value="@reboot">Sunucu Başlayınca</option>
          <option value="custom">Özel (Gelişmiş)</option>
        </select>
        <input id="swal-cron-custom" class="swal2-input" placeholder="Cron İfadesi (*/5 * * * *)" style="display: none; margin-top: 10px;">
      `,
            focusConfirm: false,
            background: '#18181b',
            color: '#fff',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            preConfirm: () => {
                const name = (document.getElementById('swal-name') as HTMLInputElement).value;
                const select = (document.getElementById('swal-cron-select') as HTMLSelectElement).value;
                const custom = (document.getElementById('swal-cron-custom') as HTMLInputElement).value;

                if (!name) Swal.showValidationMessage('Lütfen bir isim girin');
                if (!select) Swal.showValidationMessage('Lütfen bir zaman seçin');

                const cron = select === 'custom' ? custom : select;
                if (!cron) Swal.showValidationMessage('Cron ifadesi gerekli');

                return { name, cron };
            }
        });

        if (formValues) {
            await fetch('/api/schedules', {
                method: 'POST',
                body: JSON.stringify(formValues)
            });
            fetchSchedules();
        }
    };

    const handleDelete = async (id: string) => {
        const res = await Swal.fire({
            title: 'Sil?',
            icon: 'warning',
            showCancelButton: true,
            background: '#18181b',
            color: '#fff',
            confirmButtonColor: '#d33'
        });
        if (res.isConfirmed) {
            await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
            fetchSchedules();
        }
    };

    const toggleActive = async (id: string, current: boolean) => {
        // Optimistic update
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, isActive: !current } : s));
        await fetch(`/api/schedules/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive: !current })
        });
        fetchSchedules();
    };

    const addTask = async (scheduleId: string) => {
        const { value: taskForm } = await Swal.fire({
            title: 'Yeni İşlem Ekle',
            html: `
        <select id="task-action" class="swal2-input" style="background: #333; color: white">
          <option value="command">Komut Gönder</option>
          <option value="power">Güç İşlemi</option>
          <option value="backup">Yedek Al</option>
        </select>
        <input id="task-payload" class="swal2-input" placeholder="Komut (örn: say Merhaba) veya (start/stop)">
        <input id="task-delay" type="number" class="swal2-input" placeholder="Gecikme (saniye)">
      `,
            focusConfirm: false,
            background: '#18181b',
            color: '#fff',
            showCancelButton: true,
            preConfirm: () => {
                return {
                    action: (document.getElementById('task-action') as HTMLInputElement).value,
                    payload: (document.getElementById('task-payload') as HTMLInputElement).value,
                    delay: (document.getElementById('task-delay') as HTMLInputElement).value
                }
            }
        });

        if (taskForm) {
            await fetch(`/api/schedules/${scheduleId}/tasks`, {
                method: 'POST',
                body: JSON.stringify(taskForm)
            });
            fetchSchedules();
        }
    };

    const deleteTask = async (taskId: string) => {
        await fetch(`/api/schedules/tasks/${taskId}`, { method: 'DELETE' });
        fetchSchedules();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1200px] mx-auto flex flex-col gap-6"
        >
            <Card className={`p-6 border shadow-2xl flex items-center justify-between ${theme.classes.bgSecondary} ${theme.classes.border} bg-opacity-40`}>
                <div>
                    <h1 className={`text-2xl font-bold flex items-center gap-2 ${theme.classes.text}`}>
                        <CalendarClock className={theme.classes.textAccent} /> Zamanlanmış Görevler
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Sunucunuzu otomatize edin: Yedekleme, yeniden başlatma ve komutlar.
                    </p>
                </div>
                <Button onClick={handleCreate} className={`${theme.classes.bgPrimary} text-white shadow-lg transform hover:scale-105 transition-all`}>
                    <Plus className="w-4 h-4 mr-2" /> Yeni Görev
                </Button>
            </Card>

            <div className="grid gap-4">
                {schedules.map((schedule) => (
                    <Card key={schedule.id} className={`overflow-hidden border transition-colors ${theme.classes.border} bg-[#09090b]`}>
                        <div className="p-4 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setExpandedId(expandedId === schedule.id ? null : schedule.id)}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    {expandedId === schedule.id ? <ChevronDown /> : <ChevronRight />}
                                </Button>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-white">{schedule.name}</h3>
                                        <div className={clsx("text-xs px-2 py-0.5 rounded-full border", schedule.isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-800 border-zinc-700 text-zinc-500")}>
                                            {schedule.isActive ? 'AKTİF' : 'PASİF'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 mt-1">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {schedule.cron}</span>
                                        <span>Son: {schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Hiç çalışmadı'}</span>
                                        <span className={theme.classes.textAccent}>Sonraki: {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'Hesaplanıyor...'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => toggleActive(schedule.id, schedule.isActive)}
                                    variant="secondary"
                                    className={clsx("h-8", schedule.isActive ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20")}
                                >
                                    {schedule.isActive ? 'Durdur' : 'Aktifleştir'}
                                </Button>
                                <Button
                                    onClick={() => handleDelete(schedule.id)}
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedId === schedule.id && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="bg-[#0c0c0e] border-t border-white/5"
                                >
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">İşlem Listesi</h4>
                                            <Button size="sm" variant="outline" onClick={() => addTask(schedule.id)} className="h-7 text-xs border-white/10 hover:bg-white/5">
                                                <Plus className="w-3 h-3 mr-1" /> İşlem Ekle
                                            </Button>
                                        </div>

                                        {schedule.tasks.length === 0 && (
                                            <div className="text-center py-8 text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-lg">
                                                Bu görev için henüz işlem eklenmemiş.
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {schedule.tasks.map((task, i) => (
                                                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-white/5 group">
                                                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-mono text-zinc-500">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            {task.action === 'command' && <TerminalSquare className="w-4 h-4 text-indigo-400" />}
                                                            {task.action === 'power' && <Power className="w-4 h-4 text-red-400" />}
                                                            {task.action === 'backup' && <Archive className="w-4 h-4 text-emerald-400" />}
                                                            <span className="text-zinc-200 font-medium text-sm capitalize">{task.action}</span>
                                                        </div>
                                                        <div className="text-xs text-zinc-500 font-mono mt-0.5">
                                                            {task.payload || '(Parametre yok)'} {task.delay > 0 && `• ${task.delay}sn gecikme`}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => deleteTask(task.id)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                ))}

                {schedules.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <CalendarClock className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-500">Görev Bulunamadı</h3>
                        <p className="text-zinc-600">Henüz bir zamanlanmış görev oluşturmadınız.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
