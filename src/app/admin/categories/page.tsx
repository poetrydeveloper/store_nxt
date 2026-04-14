'use client';

import { useEffect, useState } from 'react';

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
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    level: 0,
    parentId: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
    const method = editingCategory ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        description: form.description,
        image: form.image,
        level: parseInt(form.level.toString()),
        parentId: form.parentId ? parseInt(form.parentId) : undefined,
      }),
    });
    
    if (res.ok) {
      setForm({ name: '', slug: '', description: '', image: '', level: 0, parentId: '' });
      setEditingCategory(null);
      fetchCategories();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      level: category.level,
      parentId: category.parentId?.toString() || '',
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить категорию? Все подкатегории тоже будут удалены.')) return;
    
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) fetchCategories();
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setForm({ name: '', slug: '', description: '', image: '', level: 0, parentId: '' });
  };

  // Построение дерева для отображения с отступами
  const buildTree = (items: Category[], parentId: number | null = null, level: number = 0): (Category & { displayLevel: number })[] => {
    let result: (Category & { displayLevel: number })[] = [];
    const filtered = items.filter(item => (item.parentId || null) === parentId);
    
    for (const item of filtered) {
      result.push({ ...item, displayLevel: level });
      result = result.concat(buildTree(items, item.id, level + 1));
    }
    return result;
  };

  const treeCategories = buildTree(categories);

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Управление категориями</h1>
      
      {/* Форма создания/редактирования */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">
          {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Название *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Slug (url-имя) *"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <textarea
            placeholder="Описание"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={2}
          />
          <input
            type="text"
            placeholder="Изображение (URL)"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Уровень вложенности (0 - корень)"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) || 0 })}
            className="w-full border rounded px-3 py-2"
          />
          
          {/* Выбор родительской категории */}
          <select
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Нет (корневая категория)</option>
            {treeCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {'—'.repeat(cat.displayLevel)} {cat.name}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {editingCategory ? 'Обновить' : 'Создать'}
            </button>
            {editingCategory && (
              <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Список категорий с иерархией */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Название</th>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-left">Уровень</th>
              <th className="px-4 py-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {treeCategories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="px-4 py-2">{cat.id}</td>
                <td className="px-4 py-2">
                  {'—'.repeat(cat.displayLevel)} {cat.name}
                </td>
                <td className="px-4 py-2">{cat.slug}</td>
                <td className="px-4 py-2">{cat.level}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(cat)} className="text-blue-600 mr-2">✏️</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600">🗑️</button>
                 </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
