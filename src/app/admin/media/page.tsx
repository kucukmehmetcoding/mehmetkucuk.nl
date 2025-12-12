'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload, Trash2, Copy, Check } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    for (const file of files) {
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
          const newItem: MediaItem = {
            id: Date.now().toString(),
            url: publicUrl,
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          };
          setMedia([newItem, ...media]);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed');
      }
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        setMedia(media.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Media Library</h1>
        <p className="text-slate-600 mt-1">Manage images and media files</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
            <label className="cursor-pointer">
              <Upload className="mx-auto mb-2 text-slate-400" size={32} />
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Media Files ({media.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {media.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No media yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="bg-slate-100 h-40 flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">{(item.size / 1024).toFixed(2)} KB</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(item.url, item.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
