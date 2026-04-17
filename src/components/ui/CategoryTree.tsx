// src/components/ui/CategoryTree.tsx

'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  level: number;
  parentId?: number;
  children?: Category[];
}

interface CategoryTreeProps {
  onSelectCategory?: (categoryId: number, categoryName: string) => void;
  selectedCategoryId?: number | null;
  className?: string;
}

export default function CategoryTree({ onSelectCategory, selectedCategoryId, className = '' }: CategoryTreeProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Загружаем категории с правильной структурой дерева
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        // Преобразуем плоский список в дерево
        const flatList = data.data;
        const tree = buildTree(flatList);
        setCategories(tree);
        
        // По умолчанию раскрываем все узлы на 1 уровень
        const rootIds = new Set(tree.map((c: Category) => c.id));
        setExpandedNodes(rootIds);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция построения дерева из плоского списка
  const buildTree = (flatList: Category[]): Category[] => {
    const map = new Map<number, Category>();
    const roots: Category[] = [];

    // Сначала создаём карту всех категорий
    flatList.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    // Затем формируем дерево
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

  useEffect(() => {
    fetchCategories();
  }, []);

  // Переключение раскрытия узла
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

  // Рекурсивный рендер дерева с отступами
  const renderTree = (items: Category[], level: number = 0) => {
    return items.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedNodes.has(category.id);
      const isSelected = selectedCategoryId === category.id;

      return (
        <div key={category.id}>
          <div
            className={`flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
              isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''
            }`}
            style={{ paddingLeft: `${12 + level * 24}px` }}
            onClick={() => onSelectCategory?.(category.id, category.name)}
          >
            {/* Иконка раскрытия для узлов с детьми */}
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => toggleNode(category.id, e)}
                className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {!hasChildren && <span className="w-5 flex-shrink-0" />}
            
            {/* Иконка категории */}
            <span className="text-gray-500 flex-shrink-0">📁</span>
            
            {/* Название категории */}
            <span className={`truncate ${isSelected ? 'font-medium text-blue-700' : ''}`}>
              {category.name}
            </span>
            
            {/* ID категории */}
            <span className="text-xs text-gray-400 ml-1 flex-shrink-0">(id: {category.id})</span>
            
            {/* Количество подкатегорий */}
            {hasChildren && (
              <span className="text-xs text-gray-400 ml-1 flex-shrink-0">
                [{category.children!.length}]
              </span>
            )}
          </div>
          
          {/* Дочерние элементы */}
          {hasChildren && isExpanded && (
            <div>
              {renderTree(category.children || [], level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Загрузка категорий...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Нет категорий. Создайте первую категорию.
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-3 bg-white ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2 pb-2 border-b flex justify-between items-center">
        <span>📂 Дерево категорий</span>
        <button
          type="button"
          onClick={() => {
            // Раскрыть всё
            const allIds = new Set<number>();
            const collectIds = (items: Category[]) => {
              items.forEach(item => {
                allIds.add(item.id);
                if (item.children) collectIds(item.children);
              });
            };
            collectIds(categories);
            setExpandedNodes(allIds);
          }}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Раскрыть всё
        </button>
      </div>
      <div className="overflow-y-auto max-h-96">
        {renderTree(categories)}
      </div>
    </div>
  );
}