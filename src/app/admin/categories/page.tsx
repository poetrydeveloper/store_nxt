// src/app/admin/categories/page.tsx

'use client';

import { useEffect, useState } from 'react';
import CategoryTree from '@/components/ui/CategoryTree';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  level: number;
  parentId?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [selectedParentName, setSelectedParentName] = useState<string>('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    level: 0,
  });

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) setCategories(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[ё]/g, 'e');
  };

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setForm({ ...form, name, slug });
  };

  const handleSelectParent = (categoryId: number, categoryName: string) => {
    setSelectedParentId(categoryId.toString());
    setSelectedParentName(categoryName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        description: form.description,
        image: form.image,
        level: parseInt(form.level.toString()),
        parentId: selectedParentId ? parseInt(selectedParentId) : undefined,
      }),
    });
    
    if (res.ok) {
      setForm({ name: '', slug: '', description: '', image: '', level: 0 });
      setSelectedParentId('');
      setSelectedParentName('');
      fetchCategories();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Управление категориями</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка - дерево категорий */}
        <div>
          <CategoryTree 
            onSelectCategory={handleSelectParent}
            selectedCategoryId={selectedParentId ? parseInt(selectedParentId) : null}
          />
          
          {/* Отображение выбранной родительской категории */}
          {selectedParentId && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
              📌 Родительская категория: <strong>{selectedParentName}</strong> (id: {selectedParentId})
              <button
                type="button"
                onClick={() => {
                  setSelectedParentId('');
                  setSelectedParentName('');
                }}
                className="ml-2 text-red-500 text-xs"
              >
                ✖
              </button>
            </div>
          )}
        </div>
        
        {/* Правая колонка - форма создания */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Создать категорию</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Название *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Изображение (URL)</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Создать категорию
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Список категорий (свернутый, маленький) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          📋 Список всех категорий ({categories.length})
        </summary>
        <div className="mt-2 bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-1 text-left">ID</th>
                <th className="px-3 py-1 text-left">Название</th>
                <th className="px-3 py-1 text-left">Slug</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t">
                  <td className="px-3 py-1">{cat.id}</td>
                  <td className="px-3 py-1">{cat.name}</td>
                  <td className="px-3 py-1 text-gray-500">{cat.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}