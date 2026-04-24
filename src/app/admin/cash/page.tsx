// src/app/admin/cash/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CategoryTree from './components/CategoryTree';
import CashHeader from './components/CashHeader';
import OperationTabs from './components/OperationTabs';
import SaleForm from './components/SaleForm';
import DisassemblyForm from './components/DisassemblyForm';
import SimpleForm from './components/SimpleForm';
import EventsTable from './components/EventsTable';

interface CashDay {
  id: number;
  date: string;
  isClosed: boolean;
  total: number;
}

interface CashEvent {
  id: number;
  type: string;
  totalAmount: number;
  description: string;
  paymentMethod: string;
  createdAt: string;
  createdBy: string;
  items?: { productUnit: { uniqueSerialNumber: string; product: { name: string; code: string } } }[];
}

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

export default function CashPage() {
  const router = useRouter();
  const [cashDay, setCashDay] = useState<CashDay | null>(null);
  const [events, setEvents] = useState<CashEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationType, setOperationType] = useState<'sale' | 'disassembly' | 'expense' | 'income'>('sale');
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit | null>(null);
  const [selectedDisassembledUnit, setSelectedDisassembledUnit] = useState<ProductUnit | null>(null);
  const [scenarios, setScenarios] = useState<DisassemblyScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<DisassemblyScenario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductUnit[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [simpleAmount, setSimpleAmount] = useState('');
  const [simpleDescription, setSimpleDescription] = useState('');
  
  // Состояния для быстрой продажи
  const [quickSaleForm, setQuickSaleForm] = useState({
    tempName: '',
    tempPrice: '',
    tempQuantity: '1',
  });

  const fetchCashDay = async () => {
    const res = await fetch('/api/cash-days');
    const data = await res.json();
    if (data.success) {
      const open = data.data.find((d: CashDay) => !d.isClosed);
      setCashDay(open || null);
      if (open) fetchEvents(open.id);
    }
    setLoading(false);
  };

  const fetchEvents = async (cashDayId: number) => {
    const res = await fetch(`/api/cash-events?cashDayId=${cashDayId}`);
    const data = await res.json();
    if (data.success) setEvents(data.data);
  };

  const fetchScenarios = async () => {
    const res = await fetch('/api/disassembly-scenarios');
    const data = await res.json();
    if (data.success) setScenarios(data.data);
  };

  const searchUnits = async (query: string) => {
    console.log('🔍 searchUnits вызван с query:', query);
    
    if (!query.trim() || query.trim().length < 2) {
      console.log('❌ Запрос слишком короткий, очищаем результаты');
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    const res = await fetch('/api/product-units');
    const data = await res.json();
    console.log('📦 Получены юниты:', data.data?.length);
    
    if (data.success) {
      const filtered = data.data.filter((unit: ProductUnit) =>
        (unit.physicalStatus === 'IN_STORE' || (unit.physicalStatus === 'IN_COLLECTED' && unit.disassemblyStatus === 'PARTIAL')) &&
        (unit.uniqueSerialNumber.toLowerCase().includes(query.toLowerCase()) ||
         unit.product.name.toLowerCase().includes(query.toLowerCase()) ||
         unit.product.code.toLowerCase().includes(query.toLowerCase()))
      );
      console.log('🎯 Найдено результатов:', filtered.length);
      setSearchResults(filtered);
      setShowDropdown(true);
    }
  };

  const handleRefreshCashDay = async () => {
    await fetchCashDay();
    if (cashDay) await fetchEvents(cashDay.id);
  };

  const handleQuickSale = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cashDay) {
      alert('Нет открытой смены');
      return;
    }
    
    const res = await fetch('/api/cash/pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempName: quickSaleForm.tempName,
        tempPrice: parseFloat(quickSaleForm.tempPrice),
        tempQuantity: parseInt(quickSaleForm.tempQuantity),
        cashDayId: cashDay.id,
      }),
    });
    
    if (res.ok) {
      alert('Продажа отложена! Дооформите её в разделе "Отложенные".');
      setQuickSaleForm({ tempName: '', tempPrice: '', tempQuantity: '1' });
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  useEffect(() => {
    fetchCashDay();
    fetchScenarios();
    
    const interval = setInterval(() => {
      fetchCashDay();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => searchUnits(searchTerm), 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedUnit) {
      const scenario = scenarios.find(s => s.parentProductCode === selectedUnit.product.code);
      setSelectedScenario(scenario || null);
    } else {
      setSelectedScenario(null);
    }
  }, [selectedUnit, scenarios]);

  const handleSelectUnit = (unit: ProductUnit) => {
    console.log('✅ Выбран товар:', unit.product.name);
    setSelectedUnit(unit);
    setSearchTerm(`${unit.product.name} (${unit.uniqueSerialNumber})`);
    setShowDropdown(false);
  };

  const handleSelectDisassembledUnit = (unit: ProductUnit) => {
    setSelectedUnit(unit);
    setSearchTerm(`${unit.product.name} (${unit.uniqueSerialNumber})`);
    setSelectedDisassembledUnit(unit);
  };

  const handleOpenCashDay = async () => {
    const res = await fetch('/api/cash-days', { method: 'POST' });
    if (res.ok) {
      await fetchCashDay();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const handleSell = async () => {
    if (!cashDay || !selectedUnit || !salePrice) {
      alert('Заполните все поля');
      return;
    }
    const res = await fetch('/api/inventory/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serialNumber: selectedUnit.uniqueSerialNumber,
        price: parseFloat(salePrice),
        cashDayId: cashDay.id,
        createdBy: 'admin',
        paymentMethod,
      }),
    });
    if (res.ok) {
      alert('Товар продан');
      setSelectedUnit(null);
      setSearchTerm('');
      setSalePrice('');
      await fetchCashDay();
      if (cashDay) await fetchEvents(cashDay.id);
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const handleDisassemble = async () => {
    if (!selectedUnit || !selectedScenario) {
      alert('Выберите товар и убедитесь, что есть сценарий');
      return;
    }
    const res = await fetch('/api/inventory/disassemble', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serialNumber: selectedUnit.uniqueSerialNumber,
        scenarioId: selectedScenario.id,
      }),
    });
    if (res.ok) {
      alert('Товар разобран');
      setSelectedUnit(null);
      setSearchTerm('');
      setSelectedScenario(null);
      await fetchCashDay();
      if (cashDay) await fetchEvents(cashDay.id);
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const handleCollect = async () => {
    if (!selectedUnit) {
      alert('Выберите товар');
      return;
    }
    
    if (!selectedScenario) {
      alert('Нет сценария для этого товара');
      return;
    }

    const requiredCodes = selectedScenario.childProductCodes as string[];
    
    const res = await fetch('/api/product-units');
    const data = await res.json();
    if (data.success) {
      const availableUnits = data.data.filter((unit: ProductUnit) =>
        requiredCodes.includes(unit.product.code) &&
        (unit.physicalStatus === 'IN_STORE' || (unit.physicalStatus === 'IN_COLLECTED' && unit.disassemblyStatus === 'PARTIAL'))
      );
      
      const availableByCode: Record<string, number> = {};
      availableUnits.forEach(unit => {
        availableByCode[unit.product.code] = (availableByCode[unit.product.code] || 0) + 1;
      });
      
      const missingCodes: string[] = [];
      for (const code of requiredCodes) {
        if (!availableByCode[code] || availableByCode[code] === 0) {
          missingCodes.push(code);
        }
      }
      
      if (missingCodes.length > 0) {
        alert(`Не хватает частиц для сборки:\n${missingCodes.join(', ')}`);
        return;
      }
    }

    const collectRes = await fetch('/api/inventory/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentProductCode: selectedUnit.product.code,
      }),
    });
    
    if (collectRes.ok) {
      alert('Товар собран');
      setSelectedUnit(null);
      setSearchTerm('');
      setSelectedScenario(null);
      await fetchCashDay();
      if (cashDay) await fetchEvents(cashDay.id);
    } else {
      const error = await collectRes.json();
      alert(error.error);
    }
  };

  const handleSimpleOperation = async () => {
    if (!cashDay || !simpleAmount) {
      alert('Заполните сумму');
      return;
    }
    const type = operationType === 'expense' ? 'EXPENSE' : 'INCOME';
    const res = await fetch('/api/cash-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        totalAmount: parseFloat(simpleAmount),
        description: simpleDescription,
        paymentMethod: 'CASH',
        cashDayId: cashDay.id,
        createdBy: 'admin',
        items: [],
      }),
    });
    if (res.ok) {
      alert('Операция добавлена');
      setSimpleAmount('');
      setSimpleDescription('');
      await fetchCashDay();
      if (cashDay) await fetchEvents(cashDay.id);
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const handleCreateScenario = () => {
    if (!selectedUnit) return;
    sessionStorage.setItem('scenarioParentProduct', JSON.stringify({
      id: selectedUnit.product.id,
      code: selectedUnit.product.code,
      name: selectedUnit.product.name,
    }));
    router.push('/admin/disassembly');
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <CashHeader 
        cashDay={cashDay} 
        onOpenCashDay={handleOpenCashDay}
        onRefresh={handleRefreshCashDay}
      />
      
      {!cashDay ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="mb-2 text-sm">Нет открытой кассовой смены</p>
          <button
            onClick={handleOpenCashDay}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs"
          >
            Открыть смену
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Дерево товаров - на всю ширину сверху */}
          <div className="w-full">
            <CategoryTree 
              selectedUnit={selectedUnit} 
              onSelectUnit={handleSelectUnit}
              searchQuery={searchTerm}
            />
          </div>
          
          {/* Блок операций - снизу */}
          <div className="w-full">
            <OperationTabs operationType={operationType} setOperationType={setOperationType} />
            
            {/* Быстрый поиск */}
            <div className="bg-white rounded-lg shadow p-2 mb-3">
              <div className="relative">
                <label className="block text-xs font-medium mb-0.5">🔍 Быстрый поиск</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    setSelectedUnit(null);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Введите серийный номер, название или артикул..."
                  className="w-full border rounded px-2 py-1 text-xs"
                  autoComplete="off"
                />
                {showDropdown && searchTerm && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((unit) => (
                      <div
                        key={unit.id}
                        onClick={() => handleSelectUnit(unit)}
                        className="p-1.5 hover:bg-gray-100 cursor-pointer border-b text-xs"
                      >
                        <div className="font-medium">{unit.product.name}</div>
                        <div className="text-gray-500 text-xs">
                          Серийный: {unit.uniqueSerialNumber} | Артикул: {unit.product.code}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedUnit && (
                <div className="mt-2 p-1.5 bg-blue-50 rounded text-xs flex justify-between items-center">
                  <span>✅ {selectedUnit.product.name} ({selectedUnit.uniqueSerialNumber})</span>
                  <button onClick={() => { setSelectedUnit(null); setSearchTerm(''); }} className="text-red-500 text-xs">✖</button>
                </div>
              )}
            </div>

            {/* Форма быстрой продажи */}
            <div className="bg-white rounded-lg shadow p-3 mb-3">
              <h2 className="text-sm font-semibold mb-2">⚡ Быстрая продажа (без учёта)</h2>
              <form onSubmit={handleQuickSale} className="space-y-2">
                <input
                  type="text"
                  placeholder="Название товара *"
                  value={quickSaleForm.tempName}
                  onChange={(e) => setQuickSaleForm({ ...quickSaleForm, tempName: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-xs"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Цена продажи *"
                    value={quickSaleForm.tempPrice}
                    onChange={(e) => setQuickSaleForm({ ...quickSaleForm, tempPrice: e.target.value })}
                    className="border rounded px-2 py-1 text-xs"
                    step="0.01"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Количество"
                    value={quickSaleForm.tempQuantity}
                    onChange={(e) => setQuickSaleForm({ ...quickSaleForm, tempQuantity: e.target.value })}
                    className="border rounded px-2 py-1 text-xs"
                    min="1"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-1.5 rounded text-xs hover:bg-orange-700"
                >
                  💨 Продать (без учёта)
                </button>
              </form>
            </div>

            {/* Формы операций */}
            {operationType === 'sale' && (
              <SaleForm
                selectedUnit={selectedUnit}
                salePrice={salePrice}
                setSalePrice={setSalePrice}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onSell={handleSell}
              />
            )}
            
            {operationType === 'disassembly' && (
              <DisassemblyForm
                selectedUnit={selectedUnit}
                selectedScenario={selectedScenario}
                onDisassemble={handleDisassemble}
                onCollect={handleCollect}
                onCreateScenario={handleCreateScenario}
                onSelectDisassembledUnit={handleSelectDisassembledUnit}
              />
            )}
            
            {(operationType === 'expense' || operationType === 'income') && (
              <SimpleForm
                type={operationType}
                amount={simpleAmount}
                setAmount={setSimpleAmount}
                description={simpleDescription}
                setDescription={setSimpleDescription}
                onSubmit={handleSimpleOperation}
              />
            )}

            <EventsTable events={events} cashDay={cashDay} />
          </div>
        </div>
      )}
    </div>
  );
}