'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

interface SidebarProps {
  lang: string;
}

const navItems = (lang: string) => [
  {label: 'Dashboard', href: `/${lang}/admin`, icon: '📊'},
  {label: 'Haberler', href: `/${lang}/admin/articles`, icon: '📰'},
  {label: 'Kategoriler', href: `/${lang}/admin/categories`, icon: '🏷️'},
  {label: 'Çeviriler', href: `/${lang}/admin/translations`, icon: '🌐'},
  {label: 'Otomasyon', href: `/${lang}/admin/automation`, icon: '🤖'},
  {label: 'Reklamlar', href: `/${lang}/admin/ads`, icon: '📢'},
  {label: 'Ayarlar', href: `/${lang}/admin/settings`, icon: '⚙️'},
];

export default function Sidebar({lang}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <span>Admin</span>
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {navItems(lang).map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          ← Siteyе Dön
        </Link>
      </div>
    </aside>
  );
}
