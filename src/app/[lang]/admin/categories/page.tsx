'use client';

import {useState, useEffect} from 'react';
import CategoryModal from '@/components/admin/CategoryModal';
import {deleteCategory, getCategories} from '../actions';
import {useTransition} from 'react';

interface CategoryTranslation {
  lang: string;
  name: string;
}

interface CategoryData {
  id: string;
  slug: string;
  translations: CategoryTranslation[];
}

export default function CategoriesPage({params}: {params: {lang: string}}) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | undefined>();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [params.lang]);

  const getCategoryName = (category: CategoryData) => {
    const translation = category.translations.find(t => t.lang === params.lang);
    return translation?.name || category.translations[0]?.name || category.slug;
  };

  const handleDelete = (category: CategoryData) => {
    const name = getCategoryName(category);
    if (confirm(`"${name}" kategorisini silmek istediğinizden emin misiniz?`)) {
      startTransition(async () => {
        const result = await deleteCategory(category.id);
        if (result.success) {
          setCategories(categories.filter((c) => c.id !== category.id));
        }
      });
    }
  };

  const handleEdit = (category: CategoryData) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(undefined);
    // Refresh categories
    setTimeout(fetchCategories, 500);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kategoriler</h1>
          <p className="text-slate-400">Haber kategorilerini yönetin ({categories.length})</p>
        </div>
        <button
          onClick={handleNew}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          + Yeni Kategori
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
          <p>Henüz kategori bulunmamaktadır</p>
          <button
            onClick={handleNew}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            İlk Kategoriyi Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2">{getCategoryName(category)}</h3>
              
              {/* Show all translations */}
              <div className="text-xs text-slate-400 mb-4 space-y-1">
                {category.translations.map((t) => (
                  <div key={t.lang} className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-white text-[10px] ${
                      t.lang === 'tr' ? 'bg-blue-600' :
                      t.lang === 'en' ? 'bg-green-600' :
                      'bg-orange-600'
                    }`}>
                      {t.lang.toUpperCase()}
                    </span>
                    <span>{t.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  disabled={isPending}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        category={selectedCategory}
        lang={params.lang}
      />
    </div>
  );
}