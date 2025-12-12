'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wand2, Send, Save } from 'lucide-react';

interface FormData {
  title_tr: string;
  title_en: string;
  title_nl: string;
  content_tr: string;
  content_en: string;
  content_nl: string;
  summary_tr: string;
  summary_en: string;
  summary_nl: string;
  category: string;
  tags: string;
  imageUrl: string;
  seoTitle: string;
  metaDescription: string;
  publishSchedule: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title_tr: '',
    title_en: '',
    title_nl: '',
    content_tr: '',
    content_en: '',
    content_nl: '',
    summary_tr: '',
    summary_en: '',
    summary_nl: '',
    category: 'technology',
    tags: '',
    imageUrl: '',
    seoTitle: '',
    metaDescription: '',
    publishSchedule: 'immediate',
  });

  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [imageLoading, setImageLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAIRewrite = async (field: string) => {
    if (!formData[field as keyof FormData]) {
      alert('Please write some content first');
      return;
    }

    setAiLoading((prev) => ({ ...prev, [field]: true }));
    try {
      const response = await fetch('/api/admin/ai/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          content: formData[field as keyof FormData],
          type: 'rewrite',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, [field]: data.content }));
      } else {
        alert('AI rewrite failed');
      }
    } catch (error) {
      console.error('AI rewrite failed:', error);
      alert('AI rewrite failed');
    } finally {
      setAiLoading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    try {
      // Get presigned URL
      const presignedRes = await fetch('/api/admin/media/presigned', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!presignedRes.ok) throw new Error('Failed to get presigned URL');

      const { presignedUrl, publicUrl } = await presignedRes.json();

      // Upload to S3/R2
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (uploadRes.ok) {
        setFormData((prev) => ({ ...prev, imageUrl: publicUrl }));
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Image upload failed');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (publish: boolean = false) => {
    setSubmitLoading(true);
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          publish,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/posts/${data.id}/edit`);
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Submit failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold">Create Post</h1>
        <p className="text-slate-600 mt-1">Write new article content</p>
      </div>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={imageLoading}
            className="block w-full"
          />
          {formData.imageUrl && (
            <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Multilingual Content */}
      {['tr', 'en', 'nl'].map((lang) => (
        <Card key={lang}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{lang.toUpperCase()} Content</span>
              <button
                onClick={() => handleAIRewrite(`content_${lang}`)}
                disabled={aiLoading[`content_${lang}`] || !formData[`content_${lang}` as keyof FormData]}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white px-3 py-1 rounded text-sm"
              >
                <Wand2 size={16} />
                {aiLoading[`content_${lang}`] ? 'Processing...' : 'Rewrite'}
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                name={`title_${lang}`}
                value={formData[`title_${lang}` as keyof FormData]}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Post title in ${lang.toUpperCase()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Summary</label>
              <textarea
                name={`summary_${lang}`}
                value={formData[`summary_${lang}` as keyof FormData]}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Brief summary..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                name={`content_${lang}`}
                value={formData[`content_${lang}` as keyof FormData]}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={8}
                placeholder="Article content..."
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">SEO Title</label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SEO optimized title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Meta Description</label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="SEO meta description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Publish Schedule</label>
            <select
              name="publishSchedule"
              value={formData.publishSchedule}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Publish Immediately</option>
              <option value="scheduled">Schedule for Later</option>
              <option value="draft">Save as Draft</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitLoading}
          className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg"
        >
          <Save size={20} />
          {submitLoading ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={submitLoading || !formData.title_tr || !formData.content_tr}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg"
        >
          <Send size={20} />
          {submitLoading ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  );
}
