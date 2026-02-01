'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useAppConfig } from '@/components/ConfigProvider';
import { getTheme } from '@/lib/themes';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const config = useAppConfig();
  const theme = getTheme(config.themeColor);
  const appName = config.appName;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Hesabınız oluşturuldu, giriş yapabilirsiniz.',
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Giriş Yap'
        }).then(() => {
          router.push('/login');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Hata',
          text: data.error || 'Bir hata oluştu.',
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Tamam'
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Register error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: 'Sunucuya bağlanılamadı.',
        background: '#09090b',
        color: '#fff'
      });
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden select-none`}>
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] ${theme.classes.glow} rounded-full blur-[120px] animate-pulse`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] ${theme.classes.glow} rounded-full blur-[120px] animate-pulse delay-1000`} />
      </div>

      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="z-50 w-full max-w-md p-6 relative"
      >
        <Card className={`${theme.classes.bgSecondary}/60 backdrop-blur-2xl ${theme.classes.border} border shadow-2xl`}>
          <CardHeader className="space-y-3 text-center pb-8 pt-6">
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              className="flex justify-center mb-2"
            >
              <div className={`p-4 rounded-2xl ${theme.classes.glow} border ${theme.classes.border} ring-1 ring-white/10 shadow-lg`}>
                <div className="w-12 h-12 relative">
                  <img
                    src={`/logo.png?t=${Date.now()}`}
                    alt={appName}
                    width={48}
                    height={48}
                    className="rounded-lg object-contain w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/server-icon.png';
                    }}
                  />
                </div>
              </div>
            </motion.div>
            <CardTitle className={`text-3xl font-bold tracking-tight ${theme.classes.text}`}>Hesap Oluştur</CardTitle>
            <CardDescription className={theme.classes.textSecondary}>
              {appName} topluluğuna katılın
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="relative group">
                  <User className={`absolute left-3 top-3.5 h-5 w-5 ${theme.classes.textSecondary} group-focus-within:${theme.classes.textAccent} transition-colors`} />
                  <Input
                    placeholder="Kullanıcı Adı"
                    className={`pl-10 h-12 ${theme.classes.bgSecondary} ${theme.classes.border} ${theme.classes.text} placeholder:${theme.classes.textSecondary} focus-visible:ring-offset-0 focus-visible:${theme.classes.borderAccent} transition-all font-medium`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative group">
                  <Lock className={`absolute left-3 top-3.5 h-5 w-5 ${theme.classes.textSecondary} group-focus-within:${theme.classes.textAccent} transition-colors`} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifre"
                    className={`pl-10 pr-10 h-12 ${theme.classes.bgSecondary} ${theme.classes.border} ${theme.classes.text} placeholder:${theme.classes.textSecondary} focus-visible:ring-offset-0 focus-visible:${theme.classes.borderAccent} transition-all font-medium`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-3.5 ${theme.classes.textSecondary} hover:${theme.classes.text} transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-5 pt-4">
              <Button
                type="submit"
                className={`w-full h-12 ${theme.classes.bgPrimary} ${theme.classes.text} font-bold ${theme.classes.shadow} shadow-lg transition-all active:scale-[0.98] border ${theme.classes.border}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Kaydediliyor...</span>
                  </div>
                ) : 'Kayıt Ol'}
              </Button>
              <div className={`text-sm ${theme.classes.textSecondary} text-center flex items-center justify-center gap-1.5 z-50`}>
                <span>Zaten hesabın var mı?</span>
                <Link
                  href="/login"
                  className={`${theme.classes.textAccent} font-medium hover:underline transition-colors relative z-[60] cursor-pointer`}
                >
                  Giriş Yap
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
