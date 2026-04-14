// src/app/admin/products/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  categoryId: number;
  brandId?: number;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface ProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    brandId: '',
  });

  // Загрузка товаров, категорий, брендов
  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) setProducts(data.data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) setCategories(data.data);
  };

  const fetchBrands = async () => {
    const res = await fetch('/api/brands');
    const data = await res.json();
    if (data.success) setBrands(data.data);
  };

  const fetchImages = async (productId: number) => {
    const res = await fetch(`/api/product-images?productId=${productId}`);
    const data = await res.json();
    if (data.success) setImages(data.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        name: form.name,
        description: form.description,
        categoryId: parseInt(form.categoryId),
        brandId: form.brandId ? parseInt(form.brandId) : undefined,
        galleryImages: [],
      }),
    });
    
    if (res.ok) {
      setForm({ code: '', name: '', description: '', categoryId: '', brandId: '' });
      fetchProducts();
    }
  };

  const handleAddImage = async (productId: number) => {
    const res = await fetch(`/api/product-images?productId=${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sortOrder: images.length }),
    });
    
    if (res.ok) {
      fetchImages(productId);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Удалить изображение?')) return;
    
    const res = await fetch(`/api/product-images?imageId=${imageId}`, {
      method: 'DELETE',
    });
    
    if (res.ok && selectedProduct) {
      fetchImages(selectedProduct.id);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    fetchImages(product.id);
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Управление товарами</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка - форма создания и список */}
        <div>
          {/* Форма создания товара */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Создать товар</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Артикул *"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Название *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={form.brandId}
                onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Выберите бренд</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Создать
              </button>
            </form>
          </div>
          
          {/* Список товаров */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Артикул</th>
                  <th className="px-4 py-2 text-left">Название</th>
                  <th className="px-4 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t cursor-pointer hover:bg-gray-50">
                    <td className="px-4 py-2">{product.id}</td>
                    <td className="px-4 py-2 font-mono text-sm">{product.code}</td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleSelectProduct(product)}
                        className="text-blue-600 text-sm"
                      >
                        {selectedProduct?.id === product.id ? '✓ Выбрано' : 'Выбрать'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Правая колонка - управление изображениями выбранного товара */}
        <div>
          {selectedProduct ? (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">
                Изображения товара: {selectedProduct.name}
              </h2>
              
              <button
                onClick={() => handleAddImage(selectedProduct.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
              >
                + Добавить изображение (placeholder)
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="border rounded p-2 relative">
                    <img
                      src={img.url}
                      alt={`Product ${selectedProduct.id}`}
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder?w=200&h=200&text=Error';
                      }}
                    />
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Удалить
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{img.url}</p>
                  </div>
                ))}
              </div>
              
              {images.length === 0 && (
                <p className="text-gray-500 text-center py-8">Нет изображений. Нажмите кнопку "Добавить".</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
              Выберите товар из списка, чтобы управлять изображениями
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
