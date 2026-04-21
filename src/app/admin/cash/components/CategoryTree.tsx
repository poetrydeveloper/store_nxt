// src/app/admin/cash/components/CategoryTree.tsx

'use client';

import { useState, useEffect } from 'react';

interface ProductUnit {
  id: number;
  uniqueSerialNumber: string;
  product: { id: number; code: string; name: string; categoryId: number };
  physicalStatus: string;
  disassemblyStatus: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  level: number;
  parentId?: number;
  children?: Category[];
}

interface CategoryTreeProps {
  selectedUnit: ProductUnit | null;
  onSelectUnit: (unit: ProductUnit) => void;
  searchQuery?: string;
}

export default function CategoryTree({ selectedUnit, onSelectUnit, searchQuery = '' }: CategoryTreeProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [matchedUnitIds, setMatchedUnitIds] = useState<Set<number>>(new Set());

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) {
      const tree = buildTree(data.data);
      setCategories(tree);
      const rootIds = new Set(tree.map(c => c.id));
      setExpandedNodes(rootIds);
    }
  };

  const fetchUnits = async () => {
    const res = await fetch('/api/product-units');
    const data = await res.json();
    if (data.success) {
      const available = data.data.filter((unit: ProductUnit) => 
        unit.physicalStatus === 'IN_STORE' || 
        (unit.physicalStatus === 'IN_COLLECTED' && unit.disassemblyStatus === 'PARTIAL')
      );
      setUnits(available);
    }
    setLoading(false);
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

  const getChildCategoryIds = (categoryId: number): number[] => {
    const childIds: number[] = [];
    const findChildren = (items: Category[]) => {
      for (const item of items) {
        if (item.id === categoryId) {
          if (item.children) {
            for (const child of item.children) {
              childIds.push(child.id);
              childIds.push(...getChildCategoryIds(child.id));
            }
          }
          return;
        }
        if (item.children) findChildren(item.children);
      }
    };
    findChildren(categories);
    return childIds;
  };

  const getUnitsForCategory = (categoryId: number): ProductUnit[] => {
    const allCategoryIds = [categoryId, ...getChildCategoryIds(categoryId)];
    return units.filter(unit => allCategoryIds.includes(unit.product.categoryId));
  };

  const groupUnitsByProduct = (unitsList: ProductUnit[]): Map<number, ProductUnit[]> => {
    const groupMap = new Map<number, ProductUnit[]>();
    unitsList.forEach(unit => {
      const productId = unit.product.id;
      if (!groupMap.has(productId)) {
        groupMap.set(productId, []);
      }
      groupMap.get(productId)!.push(unit);
    });
    return groupMap;
  };

  // Поиск и раскрытие категорий при изменении searchQuery
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 0) {
      const matched = units.filter(unit =>
        unit.uniqueSerialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.product.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchedIds = new Set(matched.map(u => u.id));
      setMatchedUnitIds(matchedIds);
      
      // Находим категории, содержащие найденные юниты
      const categoriesToExpand = new Set<number>();
      
      const findCategoryPath = (categoryId: number): void => {
        categoriesToExpand.add(categoryId);
        const findParent = (items: Category[], targetId: number): number | null => {
          for (const item of items) {
            if (item.id === targetId) return null;
            if (item.children) {
              for (const child of item.children) {
                if (child.id === targetId) return item.id;
                const found = findParent(item.children, targetId);
                if (found) return found;
              }
            }
          }
          return null;
        };
        
        let parentId = findParent(categories, categoryId);
        while (parentId) {
          categoriesToExpand.add(parentId);
          parentId = findParent(categories, parentId);
        }
      };
      
      matched.forEach(unit => {
        const categoryId = unit.product.categoryId;
        findCategoryPath(categoryId);
      });
      
      setExpandedNodes(prev => new Set([...prev, ...categoriesToExpand]));
      
      const productIdsToExpand = new Set(matched.map(u => u.product.id));
      setExpandedProducts(prev => new Set([...prev, ...productIdsToExpand]));
    } else {
      setMatchedUnitIds(new Set());
    }
  }, [searchQuery, units, categories]);

  useEffect(() => {
    fetchCategories();
    fetchUnits();
  }, []);

  const toggleNode = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleProductGroup = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const renderTree = (items: Category[], level: number = 0) => {
    return items.map((category) => {
      const categoryUnits = getUnitsForCategory(category.id);
      const groupedUnits = groupUnitsByProduct(categoryUnits);
      const totalCount = categoryUnits.length;
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedNodes.has(category.id);

      return (
        <div key={category.id}>
          <div
            className="flex items-center gap-0.5 py-0.5 px-1.5 rounded cursor-pointer hover:bg-gray-100 text-xs"
            style={{ paddingLeft: `${6 + level * 16}px` }}
          >
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => toggleNode(category.id, e)}
                className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 flex-shrink-0 text-xs"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {!hasChildren && <span className="w-4 flex-shrink-0" />}
            <span className="text-gray-500 flex-shrink-0 text-xs">📁</span>
            <span className="text-xs truncate">{category.name}</span>
            <span className="text-xs text-gray-400 ml-1 flex-shrink-0">({totalCount})</span>
          </div>
          
          {hasChildren && isExpanded && (
            <div>
              {renderTree(category.children || [], level + 1)}
            </div>
          )}
          
          {isExpanded && groupedUnits.size > 0 && (
            <div style={{ paddingLeft: `${6 + level * 16 + 20}px` }}>
              {Array.from(groupedUnits.entries()).map(([productId, productUnits]) => {
                const firstUnit = productUnits[0];
                const isProductExpanded = expandedProducts.has(productId);
                const count = productUnits.length;
                const allInStore = productUnits.every(u => u.physicalStatus === 'IN_STORE');
                const statusText = allInStore ? 'в наличии' : 'смешанный';
                
                const hasMatch = productUnits.some(unit => matchedUnitIds.has(unit.id));
                
                return (
                  <div key={productId}>
                    <div
                      className={`flex items-center gap-0.5 py-0.5 px-1.5 rounded cursor-pointer hover:bg-gray-100 text-xs ${
                        hasMatch ? 'bg-red-50 border-l-4 border-red-500' : ''
                      }`}
                      onClick={(e) => toggleProductGroup(productId, e)}
                    >
                      <span className="w-4 flex-shrink-0 text-gray-400 text-xs">
                        {isProductExpanded ? '▼' : '▶'}
                      </span>
                      <span className="text-gray-400 flex-shrink-0 text-xs">📦</span>
                      <div className="flex flex-col truncate">
                        <span className={`text-xs truncate ${hasMatch ? 'text-red-700 font-medium' : ''}`}>
                          {firstUnit.product.name}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {firstUnit.product.code}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 ml-1 flex-shrink-0">
                        ({count} шт.)
                      </span>
                      <span className={`text-xs ml-auto flex-shrink-0 px-1 rounded ${
                        allInStore ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {statusText}
                      </span>
                    </div>
                    
                    {isProductExpanded && (
                      <div style={{ paddingLeft: '20px' }}>
                        {productUnits.map((unit) => {
                          const isMatched = matchedUnitIds.has(unit.id);
                          return (
                            <div
                              key={unit.id}
                              onClick={() => onSelectUnit(unit)}
                              className={`flex items-center gap-0.5 py-0.5 px-1.5 rounded cursor-pointer hover:bg-gray-100 text-xs ${
                                selectedUnit?.id === unit.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                              } ${isMatched ? 'bg-red-50' : ''}`}
                            >
                              <span className="text-gray-400 flex-shrink-0 text-xs">🔧</span>
                              <span className={`font-mono text-xs ${isMatched ? 'text-red-700 font-bold' : ''}`}>
                                {unit.uniqueSerialNumber}
                              </span>
                              <span className={`text-xs ml-auto flex-shrink-0 px-1 rounded ${
                                unit.physicalStatus === 'IN_STORE' ? 'bg-green-100 text-green-800' : 
                                unit.physicalStatus === 'IN_COLLECTED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                              } ${isMatched ? 'ring-2 ring-red-400' : ''}`}>
                                {unit.physicalStatus === 'IN_STORE' ? 'в наличии' : 
                                 unit.physicalStatus === 'IN_COLLECTED' ? 'в коллекции' : unit.physicalStatus}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-2 h-[calc(100vh-180px)] overflow-y-auto">
        <div className="text-center text-gray-500 text-xs py-2">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-2 h-[calc(100vh-180px)] overflow-y-auto">
      <div className="text-xs font-medium text-gray-700 mb-1 pb-1 border-b flex justify-between items-center">
        <span>📂 Дерево товаров</span>
        <button
          onClick={() => fetchUnits()}
          className="text-blue-600 text-xs hover:underline"
          title="Обновить"
        >
          🔄
        </button>
      </div>
      {renderTree(categories)}
      {categories.length === 0 && (
        <div className="text-center text-gray-500 text-xs py-2">
          Нет категорий
        </div>
      )}
      {categories.length > 0 && units.length === 0 && (
        <div className="text-center text-gray-500 text-xs py-2">
          Нет доступных товаров
        </div>
      )}
    </div>
  );
}