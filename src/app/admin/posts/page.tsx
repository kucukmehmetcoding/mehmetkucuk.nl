'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trash2, Edit, Eye, Plus } from 'lucide-react';

interface Post {
  id: string;
  slug: string;
  published: boolean;
  createdAt: string;
  translations: Array<{
    id: string;
    lang: string;
    title: string;
    author: string;
  }>;
}

export default function PostsListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '10',
          search,
          status: status === 'all' ? '' : status,
        });

        const response = await fetch(`/api/admin/posts?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
          setTotal(data.total);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, search, status]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Posts</h1>
          <p className="text-slate-600 mt-1">Manage all articles and content</p>
        </div>
        <Link
          href="/admin/posts/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <div className="text-sm text-slate-600 flex items-center">
              {total} total posts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No posts found</div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => {
                const trTrans = post.translations.find((t) => t.lang === 'tr');
                return (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{trTrans?.title || post.slug}</h3>
                      <p className="text-sm text-slate-500">
                        {trTrans?.author || 'Unknown author'} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <button
                        onClick={() => window.open(`/post/preview?postId=${post.id}`, '_blank')}
                        className="p-2 hover:bg-slate-200 rounded text-slate-600"
                        title="Preview"
                      >
                        <Eye size={18} />
                      </button>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="p-2 hover:bg-slate-200 rounded text-slate-600"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 hover:bg-red-100 rounded text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={posts.length < 10}
          className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
