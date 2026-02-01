'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Archive, Plus, Download, Trash2, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Swal from 'sweetalert2';

interface Backup {
  id: string;
  name: string;
  size: string;
  createdAt: string;
}

import { useRouter } from 'next/navigation';

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = () => {
    fetch('/api/server/backups')
      .then(res => {
        if (res.status === 403 || res.status === 401) {
          router.push('/');
          throw new Error('Redirecting...');
        }
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setBackups(data);
        }
        setLoading(false);
      })
      .catch(err => {
        if (err.message !== 'Redirecting...') {
          console.error(err);
          setLoading(false);
        }
      });
  };

  const createBackup = async () => {
    setCreating(true);

    // Simulated progress UI
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 2;
      if (progress > 95) progress = 95;

      const dots = '.'.repeat(Math.floor(Date.now() / 500) % 4);

      Swal.update({
        title: 'Yedekleniyor' + dots,
        html: `
                <div class="mb-2 text-slate-400">Sunucu dosyaları arşivleniyor...</div>
                <div class="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div class="bg-cyan-500 h-3 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                </div>
                <div class="mt-2 text-xs text-slate-500 font-mono">%${progress} - Tahmini süre hesaplanıyor...</div>
             `
      });
    }, 500);

    Swal.fire({
      title: 'Başlatılıyor...',
      html: 'Hazırlanıyor...',
      allowOutsideClick: false,
      showConfirmButton: false,
      background: '#0f172a',
      color: '#fff',
      didOpen: () => {
        Swal.showLoading(); // Initial spinner
      }
    });

    try {
      const res = await fetch('/api/server/backups', { method: 'POST' });
      clearInterval(progressInterval);

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Yedek Oluşturuldu!',
          text: 'Dosyalar başarıyla arşivlendi.',
          timer: 2000,
          showConfirmButton: false,
          background: '#0f172a',
          color: '#fff'
        });
        fetchBackups();
      } else {
        throw new Error('API Hatası');
      }
    } catch (e) {
      clearInterval(progressInterval);
      Swal.fire({ icon: 'error', title: 'Hata', text: 'Yedek oluşturulamadı', background: '#0f172a', color: '#fff' });
    }

    setCreating(false);
  };

  const deleteBackup = async (id: string) => {
    if (!confirm('Bu yedeği silmek istediğinize emin misiniz?')) return;
    await fetch(`/api/server/backups?id=${id}`, { method: 'DELETE' });
    fetchBackups();
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Yedekler yükleniyor...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Archive className="text-cyan-400" /> Yedeklemeler
          </h2>
          <p className="text-slate-400 text-sm mt-1">Sunucunuzun anlık görüntüsünü alın ve saklayın.</p>
        </div>

        <Button
          onClick={createBackup}
          disabled={creating}
          className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 w-full md:w-auto min-h-[44px]"
        >
          <Plus className="w-5 h-5 mr-2" />
          {creating ? 'Oluşturuluyor...' : 'Yedek Oluştur'}
        </Button>
      </div>

      <div className="grid gap-4">
        {backups.length === 0 ? (
          <Card className="bg-[#0f172a] border-white/5 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Archive className="w-12 h-12 mb-4 opacity-50" />
              <p>Henüz hiç yedek alınmamış.</p>
            </CardContent>
          </Card>
        ) : (
          backups.map(backup => (
            <Card key={backup.id} className="bg-[#0f172a] border-white/5 hover:border-white/10 transition-colors group">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-black/30 flex items-center justify-center border border-white/5 text-slate-400">
                    <Archive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium truncate max-w-[200px] md:max-w-md">{backup.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" /> {backup.size}
                      </span>
                      <span>•</span>
                      <span>{format(new Date(backup.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  {/* İndirme (Download) butonu şimdilik pasif çünkü static serve yapmadık, ama ilerde eklenebilir */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/10 hover:bg-white/5 text-slate-400 min-w-[44px] min-h-[44px]"
                    onClick={() => window.location.href = `/api/server/backups/download?id=${backup.id}`}
                    title="İndir"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteBackup(backup.id)}
                    className="bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50 min-w-[44px] min-h-[44px]"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
