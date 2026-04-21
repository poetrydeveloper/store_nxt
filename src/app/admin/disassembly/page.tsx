// src/app/admin/disassembly/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  code: string;
  name: string;
}

interface DisassemblyScenario {
  id: number;
  name: string;
  parentProductCode: string;
  childProductCodes: string[];
  partsCount: number;
  isActive: boolean;
}

export default function DisassemblyPage() {
  const [scenarios, setScenarios] = useState<DisassemblyScenario[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Форма создания сценария
  const [parentProduct, setParentProduct] = useState<Product | null>(null);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [parentResults, setParentResults] = useState<Product[]>([]);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  
  const [childProducts, setChildProducts] = useState<Product[]>([]);
  const [childSearchTerms, setChildSearchTerms] = useState<string[]>([]);
  const [childResults, setChildResults] = useState<Product[][]>([]);
  const [showChildDropdowns, setShowChildDropdowns] = useState<boolean[]>([]);
  
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchScenarios = async () => {
    const res = await fetch('/api/disassembly-scenarios');
    const data = await res.json();
    if (data.success) setScenarios(data.data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) setProducts(data.data);
  };

  useEffect(() => {
    fetchScenarios();
    fetchProducts();
  }, []);

  // Проверяем, есть ли переданные данные из кассы
  useEffect(() => {
    const savedParent = sessionStorage.getItem('scenarioParentProduct');
    if (savedParent) {
      const parent = JSON.parse(savedParent);
      setParentProduct(parent);
      setParentSearchTerm(`${parent.name} (${parent.code})`);
      sessionStorage.removeItem('scenarioParentProduct');
    }
  }, []);

  // Поиск родительского товара
  const searchParentProducts = (query: string) => {
    if (!query.trim()) {
      setParentResults([]);
      return;
    }
    const filtered = products.filter(p =>
      p.code.toLowerCase().includes(query.toLowerCase()) ||
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setParentResults(filtered);
  };

  // Поиск дочерних товаров для конкретного индекса
  const searchChildProducts = (index: number, query: string) => {
    if (!query.trim()) {
      const newResults = [...childResults];
      newResults[index] = [];
      setChildResults(newResults);
      return;
    }
    const filtered = products.filter(p =>
      p.code.toLowerCase().includes(query.toLowerCase()) ||
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    const newResults = [...childResults];
    newResults[index] = filtered;
    setChildResults(newResults);
  };

  const addChildProduct = () => {
    setChildProducts([...childProducts, null as any]);
    setChildSearchTerms([...childSearchTerms, '']);
    setChildResults([...childResults, []]);
    setShowChildDropdowns([...showChildDropdowns, false]);
  };

  const removeChildProduct = (index: number) => {
    setChildProducts(childProducts.filter((_, i) => i !== index));
    setChildSearchTerms(childSearchTerms.filter((_, i) => i !== index));
    setChildResults(childResults.filter((_, i) => i !== index));
    setShowChildDropdowns(showChildDropdowns.filter((_, i) => i !== index));
  };

  const updateChildProduct = (index: number, product: Product) => {
    const newProducts = [...childProducts];
    newProducts[index] = product;
    setChildProducts(newProducts);
    
    const newTerms = [...childSearchTerms];
    newTerms[index] = `${product.name} (${product.code})`;
    setChildSearchTerms(newTerms);
    
    const newShow = [...showChildDropdowns];
    newShow[index] = false;
    setShowChildDropdowns(newShow);
  };

  const resetForm = () => {
    setParentProduct(null);
    setParentSearchTerm('');
    setParentResults([]);
    setChildProducts([]);
    setChildSearchTerms([]);
    setChildResults([]);
    setShowChildDropdowns([]);
    setIsActive(true);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parentProduct) {
      alert('Выберите родительский товар');
      return;
    }
    
    if (childProducts.length === 0 || childProducts.some(c => !c)) {
      alert('Добавьте хотя бы один дочерний товар');
      return;
    }

    const childCodes = childProducts.map(c => c.code);
    
    if (editingId) {
      // Обновляем существующий сценарий
      const res = await fetch(`/api/disassembly-scenarios?id=${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Разборка ${parentProduct.name}`,
          parentProductCode: parentProduct.code,
          childProductCodes: childCodes,
          partsCount: childCodes.length,
          isActive,
        }),
      });
      if (res.ok) {
        alert('Сценарий обновлён');
        fetchScenarios();
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } else {
      // Проверяем, существует ли уже сценарий для этого родителя
      const existingScenario = scenarios.find(s => s.parentProductCode === parentProduct.code);
      if (existingScenario) {
        alert('Сценарий для этого товара уже существует. Отредактируйте его.');
        return;
      }
      
      // Создаём новый сценарий
      const res = await fetch('/api/disassembly-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Разборка ${parentProduct.name}`,
          parentProductCode: parentProduct.code,
          childProductCodes: childCodes,
          partsCount: childCodes.length,
          isActive,
        }),
      });
      if (res.ok) {
        alert('Сценарий создан');
        fetchScenarios();
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error);
      }
    }
  };

  const editScenario = (scenario: DisassemblyScenario) => {
    resetForm();
    
    // Находим родительский товар
    const parent = products.find(p => p.code === scenario.parentProductCode);
    if (parent) {
      setParentProduct(parent);
      setParentSearchTerm(`${parent.name} (${parent.code})`);
    }
    
    // Находим дочерние товары
    const childCodes = scenario.childProductCodes as string[];
    const children = childCodes.map(code => products.find(p => p.code === code)).filter(Boolean) as Product[];
    setChildProducts(children);
    setChildSearchTerms(children.map(c => `${c.name} (${c.code})`));
    setChildResults(children.map(() => []));
    setShowChildDropdowns(children.map(() => false));
    setIsActive(scenario.isActive);
    setEditingId(scenario.id);
  };

  const deleteScenario = async (id: number) => {
    if (!confirm('Удалить сценарий?')) return;
    const res = await fetch(`/api/disassembly-scenarios?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Сценарий удалён');
      fetchScenarios();
      if (editingId === id) resetForm();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🔧 Сценарии разборки</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма создания/редактирования сценария */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">
            {editingId ? 'Редактировать сценарий' : 'Создать сценарий'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Выбор родительского товара */}
            <div>
              <label className="block text-sm font-medium mb-1">Родительский товар (коллекция) *</label>
              <div className="relative">
                <input
                  type="text"
                  value={parentSearchTerm}
                  onChange={(e) => {
                    setParentSearchTerm(e.target.value);
                    setShowParentDropdown(true);
                    searchParentProducts(e.target.value);
                    if (!e.target.value) setParentProduct(null);
                  }}
                  onFocus={() => setShowParentDropdown(true)}
                  placeholder="Введите название или артикул..."
                  className="w-full border rounded px-3 py-2 text-sm"
                  autoComplete="off"
                />
                {showParentDropdown && parentResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                    {parentResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setParentProduct(product);
                          setParentSearchTerm(`${product.name} (${product.code})`);
                          setShowParentDropdown(false);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b text-sm"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-gray-500 text-xs">Артикул: {product.code}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {parentProduct && (
                <div className="mt-1 text-xs text-green-600">
                  ✅ Выбран: {parentProduct.name} ({parentProduct.code})
                </div>
              )}
            </div>
            
            {/* Дочерние товары (саттелиты) */}
            <div>
              <label className="block text-sm font-medium mb-1">Дочерние товары (саттелиты) *</label>
              <div className="space-y-2">
                {childProducts.map((child, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={childSearchTerms[index]}
                        onChange={(e) => {
                          const newTerms = [...childSearchTerms];
                          newTerms[index] = e.target.value;
                          setChildSearchTerms(newTerms);
                          const newShow = [...showChildDropdowns];
                          newShow[index] = true;
                          setShowChildDropdowns(newShow);
                          searchChildProducts(index, e.target.value);
                          if (!e.target.value) {
                            const newProducts = [...childProducts];
                            newProducts[index] = null as any;
                            setChildProducts(newProducts);
                          }
                        }}
                        onFocus={() => {
                          const newShow = [...showChildDropdowns];
                          newShow[index] = true;
                          setShowChildDropdowns(newShow);
                        }}
                        placeholder="Введите название или артикул..."
                        className="w-full border rounded px-3 py-2 text-sm"
                        autoComplete="off"
                      />
                      {showChildDropdowns[index] && childResults[index]?.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                          {childResults[index].map((product) => (
                            <div
                              key={product.id}
                              onClick={() => updateChildProduct(index, product)}
                              className="p-2 hover:bg-gray-100 cursor-pointer border-b text-sm"
                            >
                              <div className="font-medium">{product.name}</div>
                              <div className="text-gray-500 text-xs">Артикул: {product.code}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeChildProduct(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addChildProduct}
                className="mt-2 text-blue-600 text-sm hover:underline"
              >
                + Добавить саттелит
              </button>
              {childProducts.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">Добавьте хотя бы один дочерний товар</p>
              )}
            </div>
            
            {/* Активен */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Сценарий активен
            </label>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!parentProduct || childProducts.length === 0 || childProducts.some(c => !c)}
                className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
              >
                {editingId ? 'Обновить сценарий' : 'Создать сценарий'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
              >
                Очистить
              </button>
            </div>
          </form>
        </div>
        
        {/* Список существующих сценариев */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-3 bg-gray-50 border-b">
            <h2 className="font-semibold">📋 Существующие сценарии</h2>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {scenarios.map((scenario) => {
              const parent = products.find(p => p.code === scenario.parentProductCode);
              return (
                <div key={scenario.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">
                        {parent?.name || scenario.parentProductCode}
                        <span className="text-xs text-gray-500 ml-2">({scenario.parentProductCode})</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Разбирается на {scenario.partsCount} частей:
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {(scenario.childProductCodes as string[]).map(code => {
                          const child = products.find(p => p.code === code);
                          return child?.name || code;
                        }).join(', ')}
                      </div>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${scenario.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {scenario.isActive ? 'Активен' : 'Неактивен'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => editScenario(scenario)}
                        className="text-blue-600 text-sm px-2 py-1 hover:bg-blue-50 rounded"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteScenario(scenario.id)}
                        className="text-red-600 text-sm px-2 py-1 hover:bg-red-50 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {scenarios.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Нет сценариев. Создайте первый сценарий разборки.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}