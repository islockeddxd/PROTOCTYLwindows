'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { ChevronRight, ChevronLeft, Check, Upload, Palette, Database, Server, Shield, Sparkles, LayoutDashboard, Settings, Terminal, Activity } from 'lucide-react';
import { ThemeColor, themes } from '@/lib/themes';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    appName: 'Atherise Panel',
    logoFile: null as File | null,
    themeColor: 'blue' as ThemeColor,
    database: 'sqlite',
    mongoUrl: '',
    serverRoot: '',
    adminUsername: '',
    adminPassword: '',
    adminEmail: ''
  });

  const totalSteps = 6;

  const validateStep = () => {
    if (step === 1 && !config.appName.trim()) {
      Swal.fire({ title: 'Hata', text: 'Uygulama adı gerekli', icon: 'error', background: '#1c1c2e', color: '#fff' });
      return false;
    }
    if (step === 3 && config.database === 'mongodb' && !config.mongoUrl.trim()) {
      Swal.fire({ title: 'Hata', text: 'MongoDB URL gerekli', icon: 'error', background: '#1c1c2e', color: '#fff' });
      return false;
    }
    if (step === 4 && !config.serverRoot.trim()) {
      Swal.fire({ title: 'Hata', text: 'Sunucu dizini gerekli', icon: 'error', background: '#1c1c2e', color: '#fff' });
      return false;
    }
    if (step === 5) {
      if (!config.adminUsername.trim() || !config.adminPassword.trim()) {
        Swal.fire({ title: 'Hata', text: 'Kullanıcı adı ve şifre gerekli', icon: 'error', background: '#1c1c2e', color: '#fff' });
        return false;
      }
      if (config.adminPassword.length < 6) {
        Swal.fire({ title: 'Hata', text: 'Şifre en az 6 karakter olmalı', icon: 'error', background: '#1c1c2e', color: '#fff' });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('appName', config.appName);
      formData.append('themeColor', config.themeColor);
      formData.append('database', config.database);
      formData.append('mongoUrl', config.mongoUrl);
      formData.append('serverRoot', config.serverRoot);
      formData.append('adminUsername', config.adminUsername);
      formData.append('adminPassword', config.adminPassword);
      // Email might not be backend ready, but sending it anyway
      formData.append('adminEmail', config.adminEmail);

      if (config.logoFile) {
        formData.append('logo', config.logoFile);
      }

      const res = await fetch('/api/setup', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        await Swal.fire({
          title: 'Kurulum Tamamlandı!',
          text: 'Panel başarıyla yapılandırıldı. Giriş yapabilirsiniz.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: '#1c1c2e', color: '#fff'
        });
        window.location.href = '/login';
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({ title: 'Hata', text: (error as Error).message, icon: 'error', background: '#1c1c2e', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  const currentTheme = themes[config.themeColor];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${config.themeColor === 'white' ? 'bg-slate-100' : 'bg-[#09090b]'}`}>

      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full blur-[100px] opacity-20 transition-all duration-700 ${currentTheme.classes.bgPrimary}`} />
        <div className={`absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-10 transition-all duration-700 ${currentTheme.classes.bgSecondary}`} />
      </div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

        {/* Main Card */}
        <div className={`backdrop-blur-xl border rounded-2xl p-8 shadow-2xl flex flex-col min-h-[500px] transition-all duration-300
            ${config.themeColor === 'white' ? 'bg-white/80 border-slate-200' : 'bg-slate-900/60 border-white/10'}`}>

          {/* Steps Progress */}
          <div className="mb-8 flex justify-between items-center px-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${s < step ? `${currentTheme.classes.bgPrimary} ${currentTheme.classes.text}` :
                  s === step ? `${config.themeColor === 'white' ? 'bg-slate-800 text-white' : 'bg-white text-black'}` :
                    'bg-slate-700/50 text-slate-500'
                  }`}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 6 && (
                  <div className={`w-8 h-0.5 mx-1 rounded transition-all duration-300 ${s < step ? currentTheme.classes.bgPrimary.split(' ')[0] : 'bg-slate-700/50'
                    }`} />
                )}
              </div>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <Sparkles className={`w-12 h-12 mx-auto mb-4 ${currentTheme.classes.textAccent}`} />
                  <h2 className={`text-2xl font-bold mb-2 ${config.themeColor === 'white' ? 'text-slate-800' : 'text-white'}`}>Hoş Geldiniz!</h2>
                  <p className="text-slate-400">Yeni nesil yönetim panelinizi kurmaya başlayalım.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Panel Adı</label>
                  <input
                    type="text"
                    value={config.appName}
                    onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                    placeholder="Örn: Game Panel"
                  />
                </div>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-indigo-500/50 transition cursor-pointer bg-black/10"
                  onClick={() => document.getElementById('logo-input')?.click()}>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-slate-400 text-sm">
                    {config.logoFile ? config.logoFile.name : 'Logo yüklemek için tıklayın (veya sürükleyin)'}
                  </p>
                  <input id="logo-input" type="file" accept="image/*" className="hidden"
                    onChange={(e) => setConfig({ ...config, logoFile: e.target.files?.[0] || null })} />
                </div>
              </div>
            )}

            {/* Step 2: Theme */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <Palette className={`w-12 h-12 mx-auto mb-4 ${currentTheme.classes.textAccent}`} />
                  <h2 className={`text-2xl font-bold mb-2 ${config.themeColor === 'white' ? 'text-slate-800' : 'text-white'}`}>Tema Seçin</h2>
                  <p className="text-slate-400">Panelinizin ruhunu yansıtan rengi seçin.</p>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {(Object.keys(themes) as ThemeColor[]).map((color) => (
                    <button
                      key={color}
                      onClick={() => setConfig({ ...config, themeColor: color })}
                      className={`relative group p-2 rounded-xl border-2 transition-all duration-300 ${config.themeColor === color ? `border-white scale-110 shadow-lg` : 'border-transparent hover:border-white/20'
                        }`}
                    >
                      <div className={`w-full h-12 rounded-lg ${themes[color].classes.bgPrimary} shadow-inner`} />
                      <div className="mt-2 text-xs font-medium text-center text-slate-400 capitalize">{color}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Database */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <Database className={`w-12 h-12 mx-auto mb-4 ${currentTheme.classes.textAccent}`} />
                  <h2 className={`text-2xl font-bold mb-2 ${config.themeColor === 'white' ? 'text-slate-800' : 'text-white'}`}>Veritabanı</h2>
                  <p className="text-slate-400">Verilerin nerede saklanacağını seçin.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['sqlite', 'mongodb'].map((db) => (
                    <button
                      key={db}
                      onClick={() => setConfig({ ...config, database: db as any })}
                      className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden ${config.database === db
                        ? `${currentTheme.classes.borderAccent} bg-opacity-10 ${currentTheme.classes.bgPrimary.split(' ')[0]} bg-opacity-10`
                        : 'border-white/10 hover:bg-white/5'
                        }`}
                    >
                      <div className={`text-lg font-bold mb-1 capitalize ${config.themeColor === 'white' ? 'text-slate-800' : 'text-white'}`}>{db}</div>
                      <div className="text-xs text-slate-500">{db === 'sqlite' ? 'Dosya bazlı, hızlı, kurulumsuz.' : 'Harici sunucu, ölçeklenebilir.'}</div>
                      {config.database === db && <div className={`absolute top-0 right-0 p-1.5 rounded-bl-lg ${currentTheme.classes.bgPrimary}`}><Check className="w-3 h-3 text-white" /></div>}
                    </button>
                  ))}
                </div>
                {config.database === 'mongodb' && (
                  <div className="animate-in fade-in-20">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Connection String</label>
                    <input
                      type="text"
                      value={config.mongoUrl}
                      onChange={(e) => setConfig({ ...config, mongoUrl: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="mongodb://localhost:27017/atherise"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Server */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <Server className={`w-12 h-12 mx-auto mb-4 ${currentTheme.classes.textAccent}`} />
                  <h2 className={`text-2xl font-bold mb-2 ${config.themeColor === 'white' ? 'text-slate-800' : 'text-white'}`}>Sunucu Konumu</h2>
                  <p className="text-slate-400">Yönetilecek sunucunun ana dizini.</p>
                </div>
                <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-lg text-sm text-amber-200 mb-4">
                  <span className="font-bold">Önemli:</span> Panel kullanıcısının bu klasöre yazma izni olduğundan emin olun.
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tam Dosya Yolu</label>
                  <input
                    type="text"
                    value={config.serverRoot}
                    onChange={(e) => setConfig({ ...config, serverRoot: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                    placeholder={navigator.userAgent.includes("Win") ? "C:\\Users\\Administrator\\Desktop\\Server" : "/home/user/server"}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Admin */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <Shield className={`w-12 h-12 mx-auto mb-4 ${currentTheme.classes.textAccent}`} />
                  <h2 className={`text-2xl font-bold mb-2 ${config.themeColor === 'white' ? 'text-slate-800' : 'text-white'}`}>Yönetici Oluştur</h2>
                  <p className="text-slate-400">Tam yetkili ilk kullanıcı.</p>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Kullanıcı Adı</label>
                    <input type="text" value={config.adminUsername} onChange={(e) => setConfig({ ...config, adminUsername: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="admin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">E-Posta (İsteğe Bağlı)</label>
                    <input type="email" value={config.adminEmail} onChange={(e) => setConfig({ ...config, adminEmail: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="admin@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Şifre</label>
                    <input type="password" value={config.adminPassword} onChange={(e) => setConfig({ ...config, adminPassword: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Summary */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <Check className={`w-12 h-12 mx-auto mb-4 text-green-400`} />
                  <h2 className={`text-2xl font-bold mb-2 ${config.themeColor === 'white' ? 'text-slate-800' : 'text-white'}`}>Hazır!</h2>
                  <p className="text-slate-400">Son kontrolleri yapın ve başlatın.</p>
                </div>
                <div className="bg-black/20 rounded-lg p-6 space-y-4 border border-white/5">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Panel İsmi</span>
                    <span className="text-white">{config.appName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Tema</span>
                    <span className={`capitalize ${currentTheme.classes.textAccent}`}>{config.themeColor}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Database</span>
                    <span className="text-white">{config.database}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Admin</span>
                    <span className="text-white">{config.adminUsername}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition"
            >
              <ChevronLeft className="w-4 h-4" /> Geri
            </button>
            {step < totalSteps ? (
              <button onClick={handleNext} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white shadow-lg shadow-indigo-500/20 transition hover:scale-105 ${currentTheme.classes.bgPrimary}`}>
                İleri <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-500/20 transition hover:scale-105">
                {loading ? 'Kuruluyor...' : 'BİTİR'} <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Preview Side Panel (PC Only) */}
        <div className="hidden lg:flex flex-col gap-4 sticky top-8 h-fit animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest pl-2">Canlı Önizleme</h3>

          {/* Mockup Window */}
          <div className={`rounded-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[400px] ${config.themeColor === 'white' ? 'bg-slate-50' : 'bg-[#09090b]'}`}>
            {/* Mockup Header */}
            <div className={`h-12 border-b border-white/5 flex items-center px-4 justify-between ${config.themeColor === 'white' ? 'bg-white' : 'bg-black/20'}`}>
              <div className="flex bg-black/10 rounded-md px-3 py-1.5 items-center gap-2 w-48">
                <div className={`w-2 h-2 rounded-full ${currentTheme.classes.bgPrimary}`}></div>
                <div className="h-2 w-20 bg-current opacity-20 rounded-full"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-black/10"></div>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Mockup Sidebar */}
              <div className={`w-16 border-r border-white/5 flex flex-col items-center py-4 gap-4 ${config.themeColor === 'white' ? 'bg-slate-100' : 'bg-black/40'}`}>
                <div className={`w-8 h-8 rounded-lg ${currentTheme.classes.bgPrimary} flex items-center justify-center text-white`}>A</div>
                <div className="w-8 h-0.5 bg-current opacity-10"></div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentTheme.classes.bgPrimary} bg-opacity-10 ${currentTheme.classes.textAccent}`}><LayoutDashboard className="w-4 h-4" /></div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40"><Settings className="w-4 h-4" /></div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40"><Terminal className="w-4 h-4" /></div>
              </div>

              {/* Mockup Content */}
              <div className="flex-1 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-current opacity-20 rounded font-bold"></div>
                  <div className={`px-2 py-1 rounded text-[10px] ${currentTheme.classes.bgPrimary} bg-opacity-20 ${currentTheme.classes.textAccent}`}>Online</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border border-white/5 ${config.themeColor === 'white' ? 'bg-white shadow-sm' : 'bg-white/5'}`}>
                    <div className={`mb-2 w-6 h-6 rounded flex items-center justify-center ${currentTheme.classes.bgPrimary} bg-opacity-20 ${currentTheme.classes.textAccent}`}>
                      <Activity className="w-3 h-3" />
                    </div>
                    <div className="h-2 w-12 bg-current opacity-20 rounded mb-1"></div>
                    <div className="h-3 w-16 bg-current opacity-40 rounded"></div>
                  </div>
                  <div className={`p-3 rounded-lg border border-white/5 ${config.themeColor === 'white' ? 'bg-white shadow-sm' : 'bg-white/5'}`}>
                    <div className="mb-2 w-6 h-6 rounded flex items-center justify-center bg-green-500/20 text-green-500">
                      <Terminal className="w-3 h-3" />
                    </div>
                    <div className="h-2 w-12 bg-current opacity-20 rounded mb-1"></div>
                    <div className="h-3 w-16 bg-current opacity-40 rounded"></div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border border-white/5 h-24 font-mono text-[10px] opacity-60 ${config.themeColor === 'white' ? 'bg-slate-900 text-slate-400' : 'bg-black/50'}`}>
                  &gt; Server started on port 25565<br />
                  &gt; Loaded 134 recipes<br />
                  &gt; [INFO] World generated successfully<br />
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
            <p className="text-amber-500 text-xs font-medium">✨ İpucu: Temayı daha sonra Ayarlar menüsünden değiştirebilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
