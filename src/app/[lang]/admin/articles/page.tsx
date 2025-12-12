'use client';

import {useEffect, useState} from 'react';
import ArticleModal from '@/components/admin/ArticleModal';
import {deleteArticle} from '../actions';
import {useTransition} from 'react';
import {getCategoryName} from '@/lib/categories';

export default function ArticlesPage({params}: {params: {lang: string}}) {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/articles?lang=${params.lang}`);
        const data = await response.json();
        setArticles(data.articles || []);
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.lang]);

  const handleDelete = (articleId: string) => {
    if (confirm('Bu haberi silmek istediğinizden emin misiniz?')) {
      startTransition(async () => {
        const result = await deleteArticle(params.lang, articleId);
        if (result.success) {
          setArticles(articles.filter((a) => a.id !== articleId));
        }
      });
    }
  };

  const handleEdit = (article: any) => {
    setSelectedArticle({
      id: article.id,
      title: article.translations[0]?.title || '',
      summary: article.translations[0]?.summary || '',
      body: article.translations[0]?.body || '',
      category: getCategoryName(article.category, params.lang),
      author: article.translations[0]?.author || '',
      published: article.published,
    });
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    // Refresh articles
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/articles?lang=${params.lang}`);
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };
    fetchData();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Haberler</h1>
          <p className="text-slate-400">Tüm makaleler ve haberler ({articles.length})</p>
        </div>
        <button
          onClick={handleNew}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          + Yeni Haber
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
          <p>Henüz haber eklenmemiştir</p>
          <button
            onClick={handleNew}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            İlk Haberi Ekle
          </button>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Başlık</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Kategori</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Durum</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Tarih</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {articles.map((article) => {
                const translation = article.translations[0];
                return (
                  <tr key={article.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm">{translation?.title || 'Untitled'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{getCategoryName(article.category, params.lang)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          article.published
                            ? 'bg-green-900 text-green-200'
                            : 'bg-yellow-900 text-yellow-200'
                        }`}
                      >
                        {article.published ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(article.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(article)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          disabled={isPending}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ArticleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        article={selectedArticle}
        lang={params.lang}
        categories={categories}
      />
    </div>
  );
}
