'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Technology', slug: 'technology', description: 'Tech news and updates' },
    { id: '2', name: 'Business', slug: 'business', description: 'Business and finance' },
  ]);

  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;

    const category: Category = {
      id: String(categories.length + 1),
      name: newCategory,
      slug: newCategory.toLowerCase().replace(/\s+/g, '-'),
      description: '',
    };

    setCategories([...categories, category]);
    setNewCategory('');
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Delete this category?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-4xl font-bold">Categories</h1>
        <p className="text-slate-600 mt-1">Manage article categories</p>
      </div>

      {/* Add New Category */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              placeholder="Category name..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.trim() || isAdding}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-slate-500">{category.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-200 rounded text-slate-600">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
