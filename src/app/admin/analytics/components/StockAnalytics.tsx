// src/app/admin/analytics/components/StockAnalytics.tsx

'use client';

import { useState, useEffect } from 'react';
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
        <div key={category.id} className="mb-1">
          <div 
            className="flex items-center gap-1 py-0.5 px-2 rounded cursor-pointer hover:bg-gray-100 text-xs font-medium bg-gray-50"
            style={{ marginLeft: `${level * 16}px` }}
          >
            <span className="text-gray-500 text-xs">📁</span>
            <span className="text-xs">{category.name}</span>
            <span className="text-xs text-gray-400 ml-1">
              ({categoryProducts.length})
            </span>
          </div>
          
          <div className="ml-3">
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
                  className={`border rounded-sm py-1 px-2 mb-1 ${bgColor} text-xs`}
                  style={{ marginLeft: `${level * 16 + 16}px` }}
                >
                  <div className="font-medium text-sm mb-0.5">{product.name}</div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-gray-500 text-xs">Артикул: <span className="font-mono">{product.code}</span></span>
                    
                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-center">
                        <div className={`font-bold text-base ${stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {stock}
                        </div>
                        <div className="text-xs text-gray-400">остаток</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-base">{sold}</div>
                        <div className="text-xs text-gray-400">продано</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-base">{ordered}</div>
                        <div className="text-xs text-gray-400">заказано</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-base">{disassembled}</div>
                        <div className="text-xs text-gray-400">разобрано</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold text-base ${turnover !== '-' && turnover > 60 ? 'text-red-600' : 'text-gray-800'}`}>
                          {turnover}
                        </div>
                        <div className="text-xs text-gray-400">оборот, дн</div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            sessionStorage.setItem('quickSellProduct', JSON.stringify({
                              id: product.id,
                              code: product.code,
                              name: product.name,
                            }));
                            router.push('/admin/cash');
                          }}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                          title="Продать"
                        >
                          🛒
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
                          className="bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700"
                          title="Заказать"
                        >
                          📋
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
                            className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                            title="Разобрать"
                          >
                            🔧
                          </button>
                        )}
                      </div>
                    </div>
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

  if (loading) return <div className="p-4 text-center text-sm">Загрузка данных...</div>;

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold">📊 Аналитика остатков</h1>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500">Период:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="border rounded px-2 py-1 text-xs"
          >
            {PERIOD_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => fetchData()}
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
          >
            🔄 Обновить
          </button>
        </div>
      </div>
      
      <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
        {renderTree(categories)}
        {categories.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">
            Нет категорий. Создайте первую категорию.
          </div>
        )}
      </div>
    </div>
  );
}