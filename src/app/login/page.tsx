'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Lock, Loader2} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!token.trim()) {
        setError('Token boş olamaz');
        setLoading(false);
        return;
      }

      // Verify token with server action
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token}),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Geçersiz token');
        setLoading(false);
        return;
      }

      // Token is valid, set cookie and redirect
      document.cookie = `admin_token=${token}; path=/; secure; samesite=strict`;
      localStorage.setItem('admin_token', token);
      
      // Small delay to ensure cookie is set
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 100);
    } catch (err) {
      setError('Giriş başarısız oldu: ' + String(err));
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Admin Giriş</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Admin Token</label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && handleSubmit(e as any)}
                    placeholder="Token girin"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Kontrol ediliyor...' : 'Giriş Yap'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
                Token: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">mehmetkucuk_admin_secret_2025</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
