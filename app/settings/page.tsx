'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Shield, Save, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/server/properties')
      .then(res => {
        if (res.status === 403 || res.status === 401) {
          router.push('/');
          throw new Error('Redirecting...');
        }
        if (!res.ok) throw new Error('Yetkisiz Erişim');
        return res.json();
      })
      .then(data => {
        setProperties(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.message !== 'Redirecting...') {
          console.error(err);
          setLoading(false);
        }
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setProperties(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/server/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(properties)
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Kaydedildi',
          text: 'Sunucu ayarları güncellendi. Etkili olması için sunucuyu yeniden başlatın.',
          background: '#0f172a',
          color: '#fff',
          confirmButtonColor: '#0ea5e9'
        });
      } else {
        throw new Error('Kaydetme başarısız');
      }
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: 'Ayarlar kaydedilemedi. Yetkiniz olmayabilir.',
        background: '#0f172a',
        color: '#fff'
      });
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Ayarlar yükleniyor...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Sunucu Ayarları</h2>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Settings */}
        <Card className="bg-[#0f172a] border-white/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <CardTitle>Ağ Ayarları</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-slate-300">Sunucu Portu (server-port)</Label>
              <Input
                value={properties['server-port'] || ''}
                onChange={e => handleChange('server-port', e.target.value)}
                className="bg-black/30 border-white/10"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Sunucu IP (server-ip)</Label>
              <Input
                value={properties['server-ip'] || ''}
                onChange={e => handleChange('server-ip', e.target.value)}
                placeholder="0.0.0.0 (Varsayılan)"
                className="bg-black/30 border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-[#0f172a] border-white/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              <CardTitle>Güvenlik & Mod</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
              <div>
                <Label className="text-slate-200 block">Korsan Modu (online-mode)</Label>
                <span className="text-xs text-slate-500">Kapalıysa crackli oyuncular girebilir.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={properties['online-mode'] === 'false' ? "text-red-400 font-bold" : "text-slate-500"}>KAPALI</span>
                <button
                  onClick={() => handleChange('online-mode', properties['online-mode'] === 'true' ? 'false' : 'true')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${properties['online-mode'] === 'true' ? 'bg-cyan-600' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${properties['online-mode'] === 'true' ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <span className={properties['online-mode'] === 'true' ? "text-cyan-400 font-bold" : "text-slate-500"}>AÇIK</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
              <div>
                <Label className="text-slate-200 block">White-list</Label>
                <span className="text-xs text-slate-500">Sadece listedeki oyuncular girebilir.</span>
              </div>
              <button
                onClick={() => handleChange('white-list', properties['white-list'] === 'true' ? 'false' : 'true')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${properties['white-list'] === 'true' ? 'bg-cyan-600' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${properties['white-list'] === 'true' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Other Settings (List View) */}
      <Card className="bg-[#0f172a] border-white/5">
        <CardHeader>
          <CardTitle>Diğer Ayarlar (Gelişmiş)</CardTitle>
          <CardDescription>Server.properties dosyasındaki diğer tüm ayarlar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(properties).map(([key, val]) => {
              if (['server-port', 'server-ip', 'online-mode', 'white-list'].includes(key)) return null;
              return (
                <div key={key} className="grid gap-1">
                  <Label className="text-xs text-slate-400 font-mono truncate" title={key}>{key}</Label>
                  <Input
                    value={val}
                    onChange={e => handleChange(key, e.target.value)}
                    className="h-8 text-sm bg-black/30 border-white/10"
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}