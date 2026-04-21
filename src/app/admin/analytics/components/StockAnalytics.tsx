// src/app/admin/analytics/components/StockAnalytics.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  code: string;
  name: string;
  brand: { id: number; name: string } | null;
  categoryId: number;
}

interface ProductUnit {
  id: number;
  uniqueSerialNumber: string;
  productId: number;
  physicalStatus: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  children?: Category[];
}

interface DisassemblyScenario {
  id: number;
  parentProductCode: string;
  isActive: boolean;
}

const PERIOD_OPTIONS = [
  { value: 7, label: '7 дней' },
  { value: 14, label: '14 дней' },
  { value: 30, label: '30 дней' },
  { value: 60, label: '60 дней' },
  { value: 90, label: '90 дней' },
];

export default function StockAnalytics() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [scenarios, setScenarios] = useState<DisassemblyScenario[]>([]);
  const [salesData, setSalesData] = useState<Record<number, number>>({});
  const [period, setPeriod] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, unitRes, scenarioRes, salesRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/product-units'),
        fetch('/api/disassembly-scenarios'),
        fetch(`/api/analytics/sales?days=${period}`),
      ]);
      
      const catData = await catRes.json();
      const prodData = await prodRes.json();
      const unitData = await unitRes.json();
      const scenarioData = await scenarioRes.json();
      const salesDataRes = await salesRes.json();
      
      if (catData.success) setCategories(buildTree(catData.data));
      if (prodData.success) setProducts(prodData.data);
      if (unitData.success) setUnits(unitData.data);
      if (scenarioData.success) setScenarios(scenarioData.data);
      if (salesDataRes.success) setSalesData(salesDataRes.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (flatList: Category[]): Category[] => {
    const map = new Map<number, Category>();
    const roots: Category[] = [];

    flatList.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    flatList.forEach(item => {
      const node = map.get(item.id);
      if (node) {
        if (item.parentId && map.has(item.parentId)) {
          const parent = map.get(item.parentId);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(node);
          }
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  };

  const getStockCount = (productId: number): number => {
    return units.filter(u => 
      u.productId === productId && 
      u.physicalStatus === 'IN_STORE' &&
      u.status !== 'IN_REQUEST'
    ).length;
  };

  const getOrderedCount = (productId: number): number => {
    return units.filter(u => 
      u.productId === productId && 
      u.status === 'IN_REQUEST'
    ).length;
  };

  const getDisassembledCount = (productId: number): number => {
    return units.filter(u => 
      u.productId === productId && 
      u.physicalStatus === 'IN_DISASSEMBLED'
    ).length;
  };

  const getSoldCount = (productId: number): number => {
    return salesData[productId] || 0;
  };

  const hasDisassemblyScenario = (productCode: string): boolean => {
    return scenarios.some(s => s.parentProductCode === productCode && s.isActive);
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'bg-red-50 border-red-200';
    if (stock < 3) return 'bg-yellow-50 border-yellow-200';
    return 'bg-white';
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const renderTree = (items: Category[], level: number = 0) => {
    return items.map((category) => {
      const categoryProducts = products.filter(p => p.categoryId === category.id);
      const hasChildren = category.children && category.children.length > 0;

      return (
        <div key={category.id} className="mb-2">
          <div 
            className="flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-gray-100 text-sm font-medium bg-gray-50"
            style={{ marginLeft: `${level * 20}px` }}
          >
            <span className="text-gray-500">📁</span>
            <span>{category.name}</span>
            <span className="text-xs text-gray-400 ml-1">
              ({categoryProducts.length})
            </span>
          </div>
          
          <div className="ml-4">
            {categoryProducts.map(product => {
              const stock = getStockCount(product.id);
              const ordered = getOrderedCount(product.id);
              const sold = getSoldCount(product.id);
              const disassembled = getDisassembledCount(product.id);
              const hasScenario = hasDisassemblyScenario(product.code);
              const bgColor = getStockColor(stock);
              const turnover = sold > 0 ? Math.round(stock / sold * 30) : '-';
              
              return (
                <div 
                  key={product.id}
                  className={`border rounded-lg p-3 mb-2 ${bgColor} shadow-sm hover:shadow-md transition-shadow`}
                  style={{ marginLeft: `${level * 20 + 20}px` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Артикул: <span className="font-mono">{product.code}</span>
                        {product.brand && ` | Бренд: ${product.brand.name}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stock}
                      </div>
                      <div className="text-xs text-gray-500">в наличии</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                    <div className="bg-gray-50 p-1.5 rounded text-center">
                      <div className="text-gray-500">📈 Продано за {period} дн.</div>
                      <div className="font-semibold text-base">{sold}</div>
                    </div>
                    <div className="bg-gray-50 p-1.5 rounded text-center">
                      <div className="text-gray-500">🚚 Заказано</div>
                      <div className="font-semibold text-base">{ordered}</div>
                    </div>
                    <div className="bg-gray-50 p-1.5 rounded text-center">
                      <div className="text-gray-500">🔧 Разобрано</div>
                      <div className="font-semibold text-base">{disassembled}</div>
                    </div>
                    <div className="bg-gray-50 p-1.5 rounded text-center">
                      <div className="text-gray-500">📊 Оборот (дней)</div>
                      <div className={`font-semibold text-base ${turnover !== '-' && turnover > 60 ? 'text-red-600' : 'text-green-600'}`}>
                        {turnover}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        sessionStorage.setItem('quickSellProduct', JSON.stringify({
                          id: product.id,
                          code: product.code,
                          name: product.name,
                        }));
                        router.push('/admin/cash');
                      }}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      🛒 Продать
                    </button>
                    <button
                      onClick={() => {
                        sessionStorage.setItem('quickOrderProduct', JSON.stringify({
                          id: product.id,
                          code: product.code,
                          name: product.name,
                        }));
                        router.push('/admin/orders');
                      }}
                      className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    >
                      📋 Заказать
                    </button>
                    {hasScenario && (
                      <button
                        onClick={() => {
                          sessionStorage.setItem('quickDisassembleProduct', JSON.stringify({
                            id: product.id,
                            code: product.code,
                            name: product.name,
                          }));
                          router.push('/admin/cash');
                        }}
                        className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                      >
                        🔧 Разобрать
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {category.children && renderTree(category.children, level + 1)}
          </div>
        </div>
      );
    });
  };

  if (loading) return <div className="p-4 text-center">Загрузка данных...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📊 Аналитика остатков</h1>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500">Период анализа:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {PERIOD_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => fetchData()}
            className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
          >
            🔄 Обновить
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mb-4 flex gap-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border rounded"></div>
          <span>Есть остатки</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>Остаток &lt; 3 шт.</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
          <span>Остаток 0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-50 border rounded"></div>
          <span>Оборот &gt; 60 дней</span>
        </div>
      </div>
      
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {renderTree(categories)}
        {categories.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Нет категорий. Создайте первую категорию.
          </div>
        )}
      </div>
    </div>
  );
}