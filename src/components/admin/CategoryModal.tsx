'use client';

import {useTransition, useState} from 'react';
import {createCategory, updateCategory} from '@/app/[lang]/admin/actions';

interface CategoryTranslation {
  lang: string;
  name: string;
}

interface CategoryData {
  id: string;
  slug: string;
  translations: CategoryTranslation[];
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryData;
  lang: string;
}

export default function CategoryModal({
  isOpen,
  onClose,
  category,
  lang,
}: CategoryModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Get translation for a specific language
  const getTranslation = (langCode: string) => {
    return category?.translations.find(t => t.lang === langCode)?.name || '';
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const translations = {
      tr: (formData.get('name_tr') as string)?.trim() || '',
      en: (formData.get('name_en') as string)?.trim() || '',
      nl: (formData.get('name_nl') as string)?.trim() || '',
    };

    // Validate all languages are filled
    if (!translations.tr || !translations.en || !translations.nl) {
      setError('Tüm dillerde kategori adı girilmelidir');
      return;
    }

    startTransition(async () => {
      let result;
      if (category) {
        // Düzenleme modu
        result = await updateCategory(category.id, translations);
      } else {
        // Yeni kategori oluşturma
        result = await createCategory(translations);
      }

      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Bir hata oluştu');
      }
    });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {category ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Tüm dillerde kategori adını girin
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 text-2xl"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Turkish */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">TR</span>
                Türkçe *
              </label>
              <input
                name="name_tr"
                type="text"
                defaultValue={getTranslation('tr')}
                required
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
                placeholder="Örn: Yapay Zeka"
              />
            </div>

            {/* English */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">EN</span>
                English *
              </label>
              <input
                name="name_en"
                type="text"
                defaultValue={getTranslation('en')}
                required
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
                placeholder="E.g: Artificial Intelligence"
              />
            </div>

            {/* Dutch */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded">NL</span>
                Nederlands *
              </label>
              <input
                name="name_nl"
                type="text"
                defaultValue={getTranslation('nl')}
                required
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
                placeholder="B.v: Kunstmatige Intelligentie"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
              >
                {isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
