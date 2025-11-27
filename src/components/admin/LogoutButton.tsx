'use client';

import { signOut } from 'next-auth/react';
import { useLocale } from 'next-intl';

export default function LogoutButton() {
  const locale = useLocale();

  return (
    <button
      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
      className="flex items-center w-full text-left p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors duration-200"
    >
      <span className="mr-3">🚪</span>
      Logout
    </button>
  );
}
