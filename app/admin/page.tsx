'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppConfig } from '@/components/ConfigProvider';
import { getTheme } from '@/lib/themes';
import { Check, X, Trash2, Shield, ShieldAlert, User as UserIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
  permissions: string[];
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const config = useAppConfig();
  const theme = getTheme(config.themeColor);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403 || res.status === 401) {
        router.push('/'); // Redirect to dashboard if not admin
        return;
      }
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePermission = async (user: User, perm: string) => {
    const newPerms = user.permissions.includes(perm)
      ? user.permissions.filter(p => p !== perm)
      : [...user.permissions, perm];

    // UI Update (Optimistic)
    setUsers(users.map(u => u.id === user.id ? { ...u, permissions: newPerms } : u));

    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPerms })
      });
    } catch (error) {
      // Revert on error
      fetchUsers();
      Swal.fire('Hata', 'İzin güncellenemedi', 'error');
    }
  };

  const handleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus })
      });

      if (res.ok) {
        fetchUsers();
        Swal.fire({
          icon: 'success',
          title: currentStatus ? 'Kullanıcı Devre Dışı Bırakıldı' : 'Kullanıcı Onaylandı',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire('Hata', 'İşlem başarısız', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu kullanıcı kalıcı olarak silinecek!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          fetchUsers();
          Swal.fire('Silindi!', 'Kullanıcı silindi.', 'success');
        } else {
          Swal.fire('Hata', 'Silinemedi (Admin olabilir)', 'error');
        }
      } catch (error) {
        Swal.fire('Hata', 'Silme işlemi başarısız', 'error');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Yükleniyor...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${theme.classes.text}`}>Yönetici Paneli</h1>
          <p className="text-slate-400">Kullanıcıları ve izinleri yönetin</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className={`${theme.classes.border} text-white hover:bg-white/10`}>
          Yenile
        </Button>
      </div>

      <Card className={`${theme.classes.bgSecondary}/50 backdrop-blur-xl border ${theme.classes.border}`}>
        <CardHeader>
          <CardTitle>Kullanıcı Listesi ({users.length})</CardTitle>
          <CardDescription>Kayıtlı kullanıcıların durumunu yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-black/20 text-slate-400">
                <tr>
                  <th className="px-6 py-3">Kullanıcı Adı</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Durum</th>
                  <th className="px-6 py-3">Yetkiler</th>
                  <th className="px-6 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-400'}`}>
                        {user.role === 'admin' ? <Shield size={16} /> : <UserIcon size={16} />}
                      </div>
                      {user.username}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isApproved ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <Check size={14} /> Onaylı
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-400 animate-pulse">
                          <ShieldAlert size={14} /> Beklemede
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 flex-wrap max-w-md">
                        {['start', 'stop', 'console', 'files', 'network', 'backups', 'startup', 'settings'].map(perm => (
                          <button
                            key={perm}
                            onClick={() => user.role !== 'admin' && togglePermission(user, perm)}
                            disabled={user.role === 'admin'}
                            className={`px-2 py-1 text-[10px] uppercase rounded border transition-colors ${user.permissions.includes(perm) || user.role === 'admin'
                              ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                              : 'bg-transparent border-slate-700 text-slate-600 hover:border-slate-500'
                              }`}
                          >
                            {perm}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {user.role !== 'admin' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(user.id, user.isApproved)}
                            className={user.isApproved ? "text-red-400 hover:bg-red-500/20" : "text-green-400 hover:bg-green-500/20"}
                          >
                            {user.isApproved ? "Engelle" : "Onayla"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(user.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}