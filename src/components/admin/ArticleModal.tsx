'use client';

import {useTransition} from 'react';
import {createArticle, updateArticle} from '@/app/[lang]/admin/actions';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: {
    id: string;
    title: string;
    summary: string;
    body: string;
    category: string;
    author: string;
    published: boolean;
  };
  lang: string;
  categories: string[];
}

export default function ArticleModal({
  isOpen,
  onClose,
  article,
  lang,
  categories,
}: ArticleModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      title: formData.get('title') as string,
      summary: formData.get('summary') as string,
      body: formData.get('body') as string,
      category: formData.get('category') as string,
      author: formData.get('author') as string,
      published: formData.get('published') === 'on',
    };

    startTransition(async () => {
      let result;
      if (article) {
        result = await updateArticle(lang, article.id, data);
      } else {
        result = await createArticle(lang, data);
      }

      if (result.success) {
        onClose();
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
            <h2 className="text-2xl font-bold">
              {article ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 text-2xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Başlık *</label>
              <input
                name="title"
                defaultValue={article?.title}
                required
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Özet *</label>
              <textarea
                name="summary"
                defaultValue={article?.summary}
                required
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">İçerik *</label>
              <textarea
                name="body"
                defaultValue={article?.body}
                required
                rows={6}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kategori *</label>
                <select
                  name="category"
                  defaultValue={article?.category}
                  required
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50"
                >
                  <option value="">Seçin</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Yazar *</label>
                <input
                  name="author"
                  defaultValue={article?.author}
                  required
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                name="published"
                defaultChecked={article?.published}
                className="w-4 h-4"
              />
              <label htmlFor="published" className="text-sm">
                Yayınla
              </label>
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
