'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface SeoSetting {
  id: string;
  path: string;
  title: string;
  description: string;
  keywords: string | null;
  updatedAt: Date;
}

export default function AdminSEOPage() {
  const [seoSettings, setSeoSettings] = useState<SeoSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    path: '',
    title: '',
    description: '',
    keywords: '',
  });

  useEffect(() => {
    loadSeoSettings();
  }, []);

  const loadSeoSettings = async () => {
    try {
      const response = await fetch('/api/admin/seo');
      if (response.ok) {
        const data = await response.json();
        setSeoSettings(data);
      }
    } catch (error) {
      console.error('Error loading SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save SEO setting');
      }

      setMessage({ type: 'success', text: 'SEO setting saved successfully!' });
      setFormData({ path: '', title: '', description: '', keywords: '' });
      await loadSeoSettings();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error saving settings' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm('Are you sure you want to delete this SEO setting?')) return;

    try {
      const response = await fetch(`/api/admin/seo?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete SEO setting');
      }

      setMessage({ type: 'success', text: 'SEO setting deleted successfully!' });
      await loadSeoSettings();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error deleting setting' 
      });
    }
  };

  const loadToForm = (setting: SeoSetting) => {
    setFormData({
      path: setting.path,
      title: setting.title,
      description: setting.description,
      keywords: setting.keywords || '',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          🎯 SEO Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage SEO meta tags for specific pages and routes.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {message.type === 'error' ? (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {formData.path ? 'Edit SEO Setting' : 'Add SEO Setting'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Path *
              </label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => setFormData({...formData, path: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="/tr/services, /en/about, etc."
              />
              <p className="text-xs text-gray-500 mt-1">Example: /tr, /en/blog, /nl/contact</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SEO Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Optimal length: 50-60 characters"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/60 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                maxLength={160}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Optimal length: 150-160 characters"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/160 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Keywords (Optional)
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="web development, freelance, rotterdam"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : formData.path && seoSettings.find(s => s.path === formData.path) ? 'Update Setting' : 'Add Setting'}
            </button>
          </form>
        </div>

        {/* Existing SEO Settings List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            📋 Existing SEO Settings
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : seoSettings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No SEO settings configured yet. Add your first one!
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {seoSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="border dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-mono text-sm text-blue-600 dark:text-blue-400 font-semibold">
                        {setting.path}
                      </p>
                      <h3 className="font-semibold text-gray-800 dark:text-white mt-1">
                        {setting.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {setting.description}
                      </p>
                      {setting.keywords && (
                        <p className="text-xs text-gray-500 mt-1">
                          Keywords: {setting.keywords}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => loadToForm(setting)}
                      className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(setting.path)}
                      className="text-sm px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SEO Best Practices Guide */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">💡 SEO Best Practices</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
          <li>• <strong>Title:</strong> Keep between 50-60 characters. Include primary keyword near the beginning.</li>
          <li>• <strong>Description:</strong> Keep between 150-160 characters. Make it compelling and include a call-to-action.</li>
          <li>• <strong>Keywords:</strong> Optional, but can help with organization. Comma-separated list.</li>
          <li>• <strong>Unique per page:</strong> Each page should have unique title and description.</li>
          <li>• <strong>Path format:</strong> Must match exact routes like /tr/services, /en/about, /nl/blog, etc.</li>
        </ul>
      </div>
    </div>
  );
}
