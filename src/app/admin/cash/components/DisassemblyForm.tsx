// src/app/admin/cash/components/DisassemblyForm.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProductUnit {
  id: number;
  uniqueSerialNumber: string;
  product: { id: number; code: string; name: string; categoryId: number };
  physicalStatus: string;
  disassemblyStatus: string;
}

interface DisassemblyScenario {
  id: number;
  name: string;
  parentProductCode: string;
  childProductCodes: string[];
  partsCount: number;
  isActive: boolean;
}

interface DisassemblyFormProps {
  selectedUnit: ProductUnit | null;
  selectedScenario: DisassemblyScenario | null;
  onDisassemble: () => void;
  onCollect: () => void;
  onCreateScenario: () => void;
  onEditScenario?: () => void;
  onSelectDisassembledUnit?: (unit: ProductUnit) => void;
}

export default function DisassemblyForm({
  selectedUnit,
  selectedScenario,
  onDisassemble,
  onCollect,
  onCreateScenario,
  onEditScenario,
  onSelectDisassembledUnit,
}: DisassemblyFormProps) {
  const [disassembledUnits, setDisassembledUnits] = useState<ProductUnit[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('DisassemblyForm received selectedUnit:', selectedUnit);
  }, [selectedUnit]);

  const fetchDisassembledUnits = async () => {
    const res = await fetch('/api/product-units');
    const data = await res.json();
    if (data.success) {
      const disassembled = data.data.filter((unit: ProductUnit) => 
        unit.physicalStatus === 'IN_DISASSEMBLED' && unit.disassemblyStatus === 'DISASSEMBLED'
      );
      setDisassembledUnits(disassembled);
      console.log('Разобранные юниты:', disassembled.length);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) {
      const tree = buildTree(data.data);
      setCategories(tree);
      const allIds = getAllCategoryIds(tree);
      setExpandedNodes(allIds);
    }
  };

  const buildTree = (flatList: any[]): any[] => {
    const map = new Map();
    const roots: any[] = [];

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

  const getAllCategoryIds = (items: any[]): Set<number> => {
    const ids = new Set<number>();
    const traverse = (nodes: any[]) => {
      nodes.forEach(node => {
        ids.add(node.id);
        if (node.children) traverse(node.children);
      });
    };
    traverse(items);
    return ids;
  };

  const getUnitsForCategory = (categoryId: number): ProductUnit[] => {
    return disassembledUnits.filter(unit => unit.product.categoryId === categoryId);
  };

  useEffect(() => {
    fetchDisassembledUnits();
    fetchCategories();
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

  const renderTree = (items: any[], level: number = 0) => {
    return items.map((category) => {
      const categoryUnits = getUnitsForCategory(category.id);
      const totalCount = categoryUnits.length;
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedNodes.has(category.id);

      return (
        <div key={category.id}>
          <div
            className="flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-gray-100"
            style={{ paddingLeft: `${8 + level * 20}px` }}
          >
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
            <span className="text-gray-500 flex-shrink-0">📁</span>
            <span className="text-sm truncate">{category.name}</span>
            <span className="text-xs text-gray-400 ml-1 flex-shrink-0">({totalCount})</span>
          </div>
          
          {hasChildren && isExpanded && (
            <div>
              {renderTree(category.children || [], level + 1)}
            </div>
          )}
          
          {isExpanded && categoryUnits.length > 0 && (
            <div style={{ paddingLeft: `${8 + level * 20 + 24}px` }}>
              {categoryUnits.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => {
                    if (onSelectDisassembledUnit) {
                      onSelectDisassembledUnit(unit);
                    }
                  }}
                  className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-gray-100 text-sm ${
                    selectedUnit?.id === unit.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <span className="text-gray-400 flex-shrink-0">🔧</span>
                  <div className="flex flex-col truncate">
                    <span className="truncate">{unit.product.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{unit.product.code}</span>
                  </div>
                  <span className="text-xs text-purple-600 ml-auto flex-shrink-0">
                    разобран
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="text-center text-gray-500 text-sm py-4">Загрузка...</div>
      </div>
    );
  }

  // Проверяем, можно ли разобрать товар
  const canDisassemble = selectedUnit && 
    selectedUnit.physicalStatus === 'IN_STORE' && 
    (selectedUnit.disassemblyStatus === 'MONOLITH' || selectedUnit.disassemblyStatus === 'RESTORED') &&
    selectedScenario;

  // Проверяем, можно ли собрать товар
  const canCollect = selectedUnit && 
    selectedUnit.physicalStatus === 'IN_DISASSEMBLED' && 
    selectedUnit.disassemblyStatus === 'DISASSEMBLED';

  return (
    <div className="space-y-4">
      {/* Форма для выбранного товара */}
      {selectedUnit ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-3">
            <div className="p-2 bg-blue-50 rounded text-sm">
              <div className="font-medium">📦 Выбранный товар:</div>
              <div>{selectedUnit.product.name}</div>
              <div className="text-xs text-gray-500">Серийный: {selectedUnit.uniqueSerialNumber}</div>
              <div className="text-xs text-gray-500">Артикул: {selectedUnit.product.code}</div>
              <div className="text-xs text-gray-500">Статус: {selectedUnit.physicalStatus} / {selectedUnit.disassemblyStatus}</div>
            </div>

            {selectedScenario ? (
              <>
                <div className="p-2 bg-green-50 rounded text-sm">
                  <div className="font-medium">📋 Сценарий: {selectedScenario.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Требуются частицы:
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {(selectedScenario.childProductCodes as string[]).join(', ')}
                  </div>
                </div>
                <div className="flex gap-2">
                  {canDisassemble && (
                    <button
                      type="button"
                      onClick={onDisassemble}
                      className="flex-1 bg-purple-600 text-white py-2 rounded text-sm hover:bg-purple-700"
                    >
                      🔧 Разобрать
                    </button>
                  )}
                  {canCollect && (
                    <button
                      type="button"
                      onClick={onCollect}
                      className="flex-1 bg-teal-600 text-white py-2 rounded text-sm hover:bg-teal-700"
                    >
                      🔨 Собрать
                    </button>
                  )}
                  <Link
                    href="/admin/disassembly"
                    className="flex-1 bg-blue-600 text-white py-2 rounded text-sm text-center hover:bg-blue-700"
                  >
                    📝 Редактировать сценарий
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-amber-600 text-sm mb-3">
                  Нет сценария разборки для товара "{selectedUnit.product.name}"
                </p>
                <button
                  onClick={onCreateScenario}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  + Создать сценарий
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-center text-gray-500 text-sm py-4">
            Выберите товар из дерева слева
          </p>
        </div>
      )}

      {/* Дерево разобранных наборов */}
      {disassembledUnits.length > 0 && (
        <div className="bg-white rounded-lg shadow p-3">
          <div className="text-sm font-medium text-gray-700 mb-2 pb-2 border-b">
            🔧 Разобранные наборы (для сборки)
          </div>
          {renderTree(categories)}
        </div>
      )}
    </div>
  );
}