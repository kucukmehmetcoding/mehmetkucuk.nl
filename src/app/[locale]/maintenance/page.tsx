import { useTranslations } from 'next-intl';

export default function MaintenancePage() {
  const t = useTranslations('Maintenance');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('description')}
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {t('workTitle')}
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• {t('workItem1')}</li>
            <li>• {t('workItem2')}</li>
            <li>• {t('workItem3')}</li>
          </ul>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <p>{t('completion')}</p>
          <p>{t('apology')}</p>
        </div>
        
        <div className="flex justify-center space-x-4 text-gray-400">
          <a href="mailto:info@mehmetkucuk.nl" className="hover:text-blue-600 transition-colors">
            <span className="sr-only">Email</span>
            📧
          </a>
          <a href="https://twitter.com/mehmetkucuk" className="hover:text-blue-600 transition-colors">
            <span className="sr-only">Twitter</span>
            🐦
          </a>
          <a href="/tr/login" className="inline-block mt-4 text-blue-600 hover:text-blue-800 underline text-sm">
            {t('adminLogin')}
          </a>
        </div>
      </div>
    </div>
  );
}