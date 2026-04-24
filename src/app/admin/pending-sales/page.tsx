// src/app/admin/pending-sales/page.tsx (обновлённая модалка)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CategoryTree from '../cash/components/CategoryTree';

interface PendingSale {
  id: string;
  tempName: string;
  tempPrice: number;
  tempQuantity: number;
  tempCategoryName?: string;
  tempBrandName?: string;
  status: string;
  createdAt: string;
  resolvedProduct?: { id: number; code: string; name: string };
}

interface Product {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  brandId?: number;
}

interface Category {
  id: number;
  name: string;
  parentId?: number;
}

interface Brand {
  id: number;
  name: string;
}

export default function PendingSalesPage() {
  const router = useRouter();
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<PendingSale | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  
  // Для выбора/создания товара
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Для создания нового товара
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    code: '',
    name: '',
    categoryId: '',
    brandId: '',
    description: '',
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  
  // Для приёмки
  const [receiveQuantity, setReceiveQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  // Для нового бренда
  const [showNewBrandForm, setShowNewBrandForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  
  // Для новой категории
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');

  const fetchPendingSales = async () => {
    const res = await fetch('/api/cash/pending');
    const data = await res.json();
    if (data.success) setPendingSales(data.data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) setProducts(data.data);
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

  const fetchSuppliers = async () => {
    const res = await fetch('/api/suppliers');
    const data = await res.json();
    if (data.success) setSuppliers(data.data);
  };

  useEffect(() => {
    fetchPendingSales();
    fetchProducts();
    fetchCategories();
    fetchBrands();
    fetchSuppliers();
  }, []);

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBrandName }),
    });
    
    if (res.ok) {
      const data = await res.json();
      setBrands([...brands, data.data]);
      setNewProductForm({ ...newProductForm, brandId: data.data.id.toString() });
      setShowNewBrandForm(false);
      setNewBrandName('');
      alert('Бренд создан');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const slug = newCategoryName.toLowerCase().replace(/[^a-zа-яё0-9]+/g, '-');
    
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCategoryName,
        slug,
        level: 0,
        parentId: selectedCategoryId ? parseInt(selectedCategoryId) : undefined,
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      setCategories([...categories, data.data]);
      setNewProductForm({ ...newProductForm, categoryId: data.data.id.toString() });
      setShowNewCategoryForm(false);
      setNewCategoryName('');
      alert('Категория создана');
    }
  };

  const handleCreateProduct = async () => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: newProductForm.code,
        name: newProductForm.name,
        description: newProductForm.description,
        categoryId: parseInt(newProductForm.categoryId),
        brandId: newProductForm.brandId ? parseInt(newProductForm.brandId) : undefined,
        galleryImages: [],
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      setSelectedProduct(data.data);
      setShowCreateProduct(false);
      setNewProductForm({ code: '', name: '', categoryId: '', brandId: '', description: '' });
      fetchProducts();
      alert('Товар создан');
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const handleResolve = async () => {
    if (!selectedSale || !selectedProduct) return;
    
    // Сначала принимаем товар на склад (создаём ProductUnit)
    const receivePromises = [];
    for (let i = 0; i < receiveQuantity; i++) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const serialNumber = `${selectedProduct.code}-RC-${timestamp}-${random}`;
      
      receivePromises.push(
        fetch('/api/product-units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: selectedProduct.id,
            uniqueSerialNumber: serialNumber,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
            supplierId: supplierId ? parseInt(supplierId) : undefined,
          }),
        })
      );
    }
    
    const results = await Promise.all(receivePromises);
    const failed = results.filter(r => !r.ok);
    
    if (failed.length > 0) {
      alert(`Ошибка при приёмке: ${failed.length} из ${receiveQuantity} не удались`);
      return;
    }
    
    // Теперь дооформляем продажу
    const res = await fetch(`/api/cash/pending/${selectedSale.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProduct.id,
        quantity: selectedSale.tempQuantity,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
        supplierId: supplierId ? parseInt(supplierId) : undefined,
      }),
    });
    
    if (res.ok) {
      alert(`Продажа дооформлена! Принято ${receiveQuantity} шт., продано ${selectedSale.tempQuantity} шт.`);
      setShowResolveModal(false);
      setSelectedSale(null);
      setSelectedProduct(null);
      setReceiveQuantity(1);
      setPurchasePrice('');
      setSupplierId('');
      fetchPendingSales();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">⏳ Отложенные продажи</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Дата</th>
              <th className="px-4 py-2 text-left">Товар</th>
              <th className="px-4 py-2 text-left">Цена</th>
              <th className="px-4 py-2 text-left">Кол-во</th>
              <th className="px-4 py-2 text-left">Сумма</th>
              <th className="px-4 py-2 text-left">Статус</th>
              <th className="px-4 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {pendingSales.map((sale) => (
              <tr key={sale.id} className="border-t">
                <td className="px-4 py-2 text-sm">
                  {new Date(sale.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2">{sale.tempName}</td>
                <td className="px-4 py-2">{sale.tempPrice} ₽</td>
                <td className="px-4 py-2">{sale.tempQuantity}</td>
                <td className="px-4 py-2">{sale.tempPrice * sale.tempQuantity} ₽</td>
                <td className="px-4 py-2">
                  {sale.status === 'PENDING' && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">⏳ Ожидает</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {sale.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setSelectedSale(sale);
                        setShowResolveModal(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      🔄 Дооформить
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {pendingSales.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Нет отложенных продаж
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Модалка дооформления */}
      {showResolveModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">🔄 Дооформление продажи</h2>
              <button onClick={() => setShowResolveModal(false)} className="text-gray-500 hover:text-gray-700">✖</button>
            </div>
            
            {/* Информация об отложенной продаже */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p><strong>Временные данные:</strong></p>
              <p>Название: {selectedSale.tempName}</p>
              <p>Цена: {selectedSale.tempPrice} ₽ × {selectedSale.tempQuantity} = {selectedSale.tempPrice * selectedSale.tempQuantity} ₽</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Левая колонка - дерево категорий */}
              <div className="border rounded-lg p-3">
                <h3 className="font-medium mb-2">📁 Дерево категорий</h3>
                <CategoryTree
                  selectedUnit={null}
                  onSelectUnit={() => {}}
                  onSelectCategory={(id, name) => {
                    setSelectedCategoryId(id.toString());
                    setSelectedCategoryName(name);
                    if (showCreateProduct) {
                      setNewProductForm({ ...newProductForm, categoryId: id.toString() });
                    }
                  }}
                />
                {selectedCategoryName && (
                  <div className="mt-2 text-sm text-green-600">
                    Выбрана категория: {selectedCategoryName}
                  </div>
                )}
                <button
                  onClick={() => setShowNewCategoryForm(true)}
                  className="mt-2 text-blue-600 text-sm hover:underline"
                >
                  + Создать новую категорию
                </button>
              </div>
              
              {/* Правая колонка - выбор/создание товара */}
              <div className="border rounded-lg p-3">
                <h3 className="font-medium mb-2">📦 Товар</h3>
                
                {!showCreateProduct ? (
                  <>
                    <input
                      type="text"
                      placeholder="Поиск существующего товара..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm mb-2"
                    />
                    <div className="max-h-40 overflow-y-auto border rounded mb-2">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => setSelectedProduct(product)}
                          className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedProduct?.id === product.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">Артикул: {product.code}</div>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && searchTerm && (
                        <div className="p-4 text-center text-gray-500">Товары не найдены</div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowCreateProduct(true)}
                      className="w-full bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700"
                    >
                      + Создать новый товар
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Создание нового товара</h4>
                      <button
                        onClick={() => setShowCreateProduct(false)}
                        className="text-gray-500 text-sm hover:text-gray-700"
                      >
                        ← Вернуться к поиску
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Артикул *"
                      value={newProductForm.code}
                      onChange={(e) => setNewProductForm({ ...newProductForm, code: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Название *"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                    
                    <div className="flex gap-2">
                      <select
                        value={newProductForm.categoryId}
                        onChange={(e) => setNewProductForm({ ...newProductForm, categoryId: e.target.value })}
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      >
                        <option value="">Выберите категорию</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowNewCategoryForm(true)}
                        className="bg-gray-200 px-2 rounded text-sm hover:bg-gray-300"
                      >
                        📁
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={newProductForm.brandId}
                        onChange={(e) => setNewProductForm({ ...newProductForm, brandId: e.target.value })}
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      >
                        <option value="">Выберите бренд</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowNewBrandForm(true)}
                        className="bg-gray-200 px-2 rounded text-sm hover:bg-gray-300"
                      >
                        🏢
                      </button>
                    </div>
                    
                    <textarea
                      placeholder="Описание"
                      value={newProductForm.description}
                      onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      rows={2}
                    />
                    
                    <button
                      onClick={handleCreateProduct}
                      disabled={!newProductForm.code || !newProductForm.name || !newProductForm.categoryId}
                      className="w-full bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Создать товар
                    </button>
                  </div>
                )}
                
                {selectedProduct && !showCreateProduct && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                    ✅ Выбран: {selectedProduct.name} ({selectedProduct.code})
                  </div>
                )}
              </div>
            </div>
            
            {/* Приёмка на склад */}
            <div className="mt-4 p-3 border rounded-lg">
              <h3 className="font-medium mb-2">📥 Приёмка на склад</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500">Количество для приёмки</label>
                  <input
                    type="number"
                    value={receiveQuantity}
                    onChange={(e) => setReceiveQuantity(parseInt(e.target.value) || 1)}
                    className="w-full border rounded px-2 py-1 text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Цена закупки (₽)</label>
                  <input
                    type="number"
                    placeholder="Опционально"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Поставщик</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="">Выберите</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleResolve}
                disabled={!selectedProduct}
                className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
              >
                ✅ Подтвердить дооформление
              </button>
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded text-sm hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Модалка создания категории */}
      {showNewCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
            <h3 className="text-lg font-semibold mb-3">Создать категорию</h3>
            <input
              type="text"
              placeholder="Название категории"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateCategory}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Создать
              </button>
              <button
                onClick={() => setShowNewCategoryForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Модалка создания бренда */}
      {showNewBrandForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
            <h3 className="text-lg font-semibold mb-3">Создать бренд</h3>
            <input
              type="text"
              placeholder="Название бренда"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateBrand}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Создать
              </button>
              <button
                onClick={() => setShowNewBrandForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}