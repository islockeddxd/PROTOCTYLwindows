'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cpu, Save, Terminal } from 'lucide-react';
import Swal from 'sweetalert2';

import { useRouter } from 'next/navigation';

export default function StartupPage() {
  const [ram, setRam] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/server/startup')
      .then(res => {
        if (res.status === 403 || res.status === 401) {
          router.push('/');
          throw new Error('Redirecting...');
        }
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        setRam(data.ram || '');
        setContent(data.content || '');
        setLoading(false);
      })
      .catch(err => {
        if (err.message !== 'Redirecting...') {
          console.error(err);
          setLoading(false);
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/server/startup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ram })
    });

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Kaydedildi',
        text: 'Sunucuyu yeniden başlattığınızda yeni RAM değerleri geçerli olacak.',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#0ea5e9'
      });
    } else {
      Swal.fire({ icon: 'error', title: 'Hata', background: '#0f172a', color: '#fff' });
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Terminal className="text-cyan-400" /> Başlatma Ayarları
        </h2>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RAM Editor */}
        <Card className="bg-[#0f172a] border-white/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <CardTitle>Sunucu Belleği (RAM)</CardTitle>
            </div>
            <CardDescription>Sunucuya ne kadar RAM verileceğini belirleyin (Örn: 8G, 10G).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-slate-300">Maksimum RAM (-Xmx)</Label>
              <Input
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                className="bg-black/30 border-white/10 text-lg font-mono"
                placeholder="Örn: 10G"
              />
              <p className="text-xs text-slate-500">Bu değer start.bat dosyasındaki -Xmx ve -Xms değerlerini günceller.</p>
            </div>
          </CardContent>
        </Card>

        {/* Raw Command Preview */}
        <Card className="bg-[#0f172a] border-white/5 opacity-80">
          <CardHeader>
            <CardTitle>Başlatma Komutu</CardTitle>
            <CardDescription>Şu anki start.bat içeriği (Salt Okunur)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-black/50 rounded-lg border border-white/5 font-mono text-xs text-slate-400 break-all">
              {content}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
