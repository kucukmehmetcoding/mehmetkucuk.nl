'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X, Eye, EyeOff, Calendar, Tag } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string;
  published: boolean;
  featured: boolean;
  views: number;
  readingTime: number;
  metaTitle?: string;
  metaDesc?: string;
  createdAt: string;
  publishedAt?: string;
}

interface BlogFormData {
  slug: string;
  title_tr: string;
  title_en: string;
  excerpt_tr: string;
  excerpt_en: string;
  content_tr: string;
  content_en: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string;
  published: boolean;
  featured: boolean;
  metaTitle_tr: string;
  metaTitle_en: string;
  metaDesc_tr: string;
  metaDesc_en: string;
}

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    slug: '',
    title_tr: '',
    title_en: '',
    excerpt_tr: '',
    excerpt_en: '',
    content_tr: '',
    content_en: '',
    coverImage: '',
    author: 'Mehmet Küçük',
    category: 'web-development',
    tags: '',
    published: false,
    featured: false,
    metaTitle_tr: '',
    metaTitle_en: '',
    metaDesc_tr: '',
    metaDesc_en: '',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingPost ? `/api/blog/${editingPost.id}` : '/api/blog';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchPosts();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return;

    setLoading(true);
    try {
      await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(post: BlogPost) {
    try {
      await fetch(`/api/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      });
      await fetchPosts();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  }

  function handleEdit(post: BlogPost) {
    setEditingPost(post);
    const titleData = JSON.parse(post.title);
    const excerptData = JSON.parse(post.excerpt);
    const contentData = JSON.parse(post.content);
    const metaTitleData = post.metaTitle ? JSON.parse(post.metaTitle) : { tr: '', en: '' };
    const metaDescData = post.metaDesc ? JSON.parse(post.metaDesc) : { tr: '', en: '' };

    setFormData({
      slug: post.slug,
      title_tr: titleData.tr || '',
      title_en: titleData.en || '',
      excerpt_tr: excerptData.tr || '',
      excerpt_en: excerptData.en || '',
      content_tr: contentData.tr || '',
      content_en: contentData.en || '',
      coverImage: post.coverImage || '',
      author: post.author,
      category: post.category,
      tags: post.tags,
      published: post.published,
      featured: post.featured,
      metaTitle_tr: metaTitleData.tr || '',
      metaTitle_en: metaTitleData.en || '',
      metaDesc_tr: metaDescData.tr || '',
      metaDesc_en: metaDescData.en || '',
    });
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingPost(null);
    setFormData({
      slug: '',
      title_tr: '',
      title_en: '',
      excerpt_tr: '',
      excerpt_en: '',
      content_tr: '',
      content_en: '',
      coverImage: '',
      author: 'Mehmet Küçük',
      category: 'web-development',
      tags: '',
      published: false,
      featured: false,
      metaTitle_tr: '',
      metaTitle_en: '',
      metaDesc_tr: '',
      metaDesc_en: '',
    });
  }

  return (
    <div className="p-6">
      <Breadcrumb />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Blog Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Blog yazılarınızı oluşturun ve yönetin
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Yeni Yazı Ekle
        </button>
      </div>

      {loading && posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            Henüz blog yazısı eklenmemiş. İlk yazınızı ekleyin!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => {
            const titleData = JSON.parse(post.title);
            const excerptData = JSON.parse(post.excerpt);
            
            return (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex gap-4">
                  {post.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt={titleData.tr}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {titleData.tr || titleData.en}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                          {excerptData.tr || excerptData.en}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {post.published ? (
                          <span className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                            Yayında
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                            Taslak
                          </span>
                        )}
                        {post.featured && (
                          <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                            ⭐ Öne Çıkan
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {post.views} görüntülenme
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag size={14} />
                        {post.category}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePublish(post)}
                        className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition ${
                          post.published
                            ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 hover:bg-orange-200'
                            : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200'
                        }`}
                      >
                        {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                        {post.published ? 'Gizle' : 'Yayınla'}
                      </button>
                      <button
                        onClick={() => handleEdit(post)}
                        className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm"
                      >
                        <Edit size={16} />
                        Düzenle
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="flex items-center gap-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-3 py-2 rounded hover:bg-red-200 dark:hover:bg-red-800 transition text-sm"
                      >
                        <Trash2 size={16} />
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingPost ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="ornek-blog-yazisi"
                />
              </div>

              {/* Turkish Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Başlık (Türkçe) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title_tr}
                  onChange={(e) => setFormData({ ...formData, title_tr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* English Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Turkish Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Özet (Türkçe) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.excerpt_tr}
                  onChange={(e) => setFormData({ ...formData, excerpt_tr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* English Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt (English) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.excerpt_en}
                  onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Turkish Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İçerik (Türkçe - Markdown) *
                </label>
                <textarea
                  required
                  rows={10}
                  value={formData.content_tr}
                  onChange={(e) => setFormData({ ...formData, content_tr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="# Başlık&#10;&#10;İçeriğinizi markdown formatında yazın..."
                />
              </div>

              {/* English Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content (English - Markdown) *
                </label>
                <textarea
                  required
                  rows={10}
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="# Heading&#10;&#10;Write your content in markdown format..."
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kapak Görseli URL
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="web-development">Web Development</option>
                    <option value="mobile-development">Mobile Development</option>
                    <option value="ui-ux-design">UI/UX Design</option>
                    <option value="digital-marketing">Digital Marketing</option>
                    <option value="seo">SEO</option>
                    <option value="tutorials">Tutorials</option>
                    <option value="news">News</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Etiketler (virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="react, nextjs, typescript"
                  />
                </div>
              </div>

              {/* SEO Fields */}
              <div className="border-t dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  SEO Ayarları
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Başlık (Türkçe)
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle_tr}
                      onChange={(e) => setFormData({ ...formData, metaTitle_tr: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      maxLength={60}
                    />
                    <span className="text-xs text-gray-500">{formData.metaTitle_tr.length}/60</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Title (English)
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle_en}
                      onChange={(e) => setFormData({ ...formData, metaTitle_en: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      maxLength={60}
                    />
                    <span className="text-xs text-gray-500">{formData.metaTitle_en.length}/60</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Açıklama (Türkçe)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.metaDesc_tr}
                      onChange={(e) => setFormData({ ...formData, metaDesc_tr: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      maxLength={160}
                    />
                    <span className="text-xs text-gray-500">{formData.metaDesc_tr.length}/160</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Description (English)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.metaDesc_en}
                      onChange={(e) => setFormData({ ...formData, metaDesc_en: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      maxLength={160}
                    />
                    <span className="text-xs text-gray-500">{formData.metaDesc_en.length}/160</span>
                  </div>
                </div>
              </div>

              {/* Publish Options */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Yayınla</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Öne Çıkar</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : editingPost ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
