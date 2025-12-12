'use client';

import {useTransition} from 'react';
import {updateTranslation} from '@/app/[lang]/admin/actions';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  translation?: {
    id: string;
    title: string;
    summary: string;
    body: string;
    author: string;
    lang: string;
  };
  lang: string;
}

export default function TranslationModal({
  isOpen,
  onClose,
  translation,
  lang,
}: TranslationModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      title: formData.get('title') as string,
      summary: formData.get('summary') as string,
      body: formData.get('body') as string,
      author: formData.get('author') as string,
    };

    startTransition(async () => {
      if (translation) {
        const result = await updateTranslation(lang, translation.id, data);
        if (result.success) {
          onClose();
        }
      }
    });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Çeviriyi Düzenle</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 text-2xl"
            >
              ✕
            </button>
          </div>

          {translation && (
            <div className="text-sm text-slate-400">
              <p>Dil: <span className="font-medium">{translation.lang.toUpperCase()}</span></p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Başlık *</label>
              <input
                name="title"
                defaultValue={translation?.title}
                required
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Özet *</label>
              <textarea
                name="summary"
                defaultValue={translation?.summary}
                required
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">İçerik *</label>
              <textarea
                name="body"
                defaultValue={translation?.body}
                required
                rows={6}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Yazar *</label>
              <input
                name="author"
                defaultValue={translation?.author}
                required
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50"
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
