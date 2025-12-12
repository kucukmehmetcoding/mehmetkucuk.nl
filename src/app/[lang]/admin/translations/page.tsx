'use client';

import {useEffect, useState} from 'react';
import TranslationModal from '@/components/admin/TranslationModal';
import {SUPPORTED_LANGS} from '@/lib/i18n';

export default function TranslationsPage({params}: {params: {lang: string}}) {
  const [translations, setTranslations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/translations?lang=${params.lang}`);
        const data = await response.json();
        setTranslations(data.translations || []);
      } catch (error) {
        console.error('Error fetching translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.lang]);

  const handleEdit = (translation: any) => {
    setSelectedTranslation(translation);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTranslation(null);
    // Refresh translations
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/translations?lang=${params.lang}`);
        const data = await response.json();
        setTranslations(data.translations || []);
      } catch (error) {
        console.error('Error fetching translations:', error);
      }
    };
    fetchData();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Çeviriler</h1>
        <p className="text-slate-400">Çok dilli içeriği yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUPPORTED_LANGS.map((lang) => {
          const count = translations.filter((t) => t.lang === lang).length;
          return (
            <div key={lang} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-slate-400 text-sm mb-2 uppercase">{lang}</p>
              <p className="text-3xl font-bold">{count}</p>
              <p className="text-xs text-slate-500">Çeviri</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {translations.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
          <p>Henüz çeviri bulunmamaktadır</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Başlık</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Dil</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Yazar</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Tarih</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {translations.map((translation) => (
                <tr key={translation.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm">{translation.title}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs font-medium">
                      {translation.lang.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{translation.author}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(translation.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEdit(translation)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TranslationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        translation={selectedTranslation}
        lang={params.lang}
      />
    </div>
  );
}
