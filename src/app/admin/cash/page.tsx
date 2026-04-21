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
  items?: { productUnit: { uniqueSerialNumber: string; product: { name: string } } }[];
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
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const res = await fetch('/api/product-units');
    const data = await res.json();
    if (data.success) {
      const filtered = data.data.filter((unit: ProductUnit) =>
        (unit.physicalStatus === 'IN_STORE' || (unit.physicalStatus === 'IN_COLLECTED' && unit.disassemblyStatus === 'PARTIAL')) &&
        (unit.uniqueSerialNumber.toLowerCase().includes(query.toLowerCase()) ||
         unit.product.name.toLowerCase().includes(query.toLowerCase()) ||
         unit.product.code.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filtered);
    }
  };

  useEffect(() => {
    fetchCashDay();
    fetchScenarios();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => searchUnits(searchTerm), 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    console.log('selectedUnit изменился:', selectedUnit);
    if (selectedUnit) {
      console.log('Товар выбран:', selectedUnit.product.name, selectedUnit.product.code);
      const scenario = scenarios.find(s => s.parentProductCode === selectedUnit.product.code);
      console.log('Найден сценарий:', scenario);
      setSelectedScenario(scenario || null);
    } else {
      setSelectedScenario(null);
    }
  }, [selectedUnit, scenarios]);

  const handleSelectUnit = (unit: ProductUnit) => {
    console.log('handleSelectUnit вызван:', unit);
    setSelectedUnit(unit);
    setSearchTerm(`${unit.product.name} (${unit.uniqueSerialNumber})`);
    setShowDropdown(false);
  };

  const handleSelectDisassembledUnit = (unit: ProductUnit) => {
    console.log('handleSelectDisassembledUnit вызван:', unit);
    setSelectedUnit(unit);
    setSearchTerm(`${unit.product.name} (${unit.uniqueSerialNumber})`);
    setSelectedDisassembledUnit(unit);
  };

  const handleOpenCashDay = async () => {
    const res = await fetch('/api/cash-days', { method: 'POST' });
    if (res.ok) fetchCashDay();
    else alert('Ошибка открытия смены');
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
      fetchCashDay();
      if (cashDay) fetchEvents(cashDay.id);
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
    console.log('Разборка товара:', selectedUnit.uniqueSerialNumber, 'сценарий:', selectedScenario.id);
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
      fetchCashDay();
      if (cashDay) fetchEvents(cashDay.id);
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
    
    console.log('Сборка товара:', selectedUnit.uniqueSerialNumber);
    
    // Проверяем, есть ли все частицы для сборки
    if (!selectedScenario) {
      alert('Нет сценария для этого товара');
      return;
    }

    // Получаем список всех частиц, необходимых для сборки
    const requiredCodes = selectedScenario.childProductCodes as string[];
    
    // Проверяем наличие всех частиц
    const res = await fetch('/api/product-units');
    const data = await res.json();
    if (data.success) {
      const availableUnits = data.data.filter((unit: ProductUnit) =>
        requiredCodes.includes(unit.product.code) &&
        (unit.physicalStatus === 'IN_STORE' || (unit.physicalStatus === 'IN_COLLECTED' && unit.disassemblyStatus === 'PARTIAL'))
      );
      
      // Группируем по артикулу
      const availableByCode: Record<string, number> = {};
      availableUnits.forEach(unit => {
        availableByCode[unit.product.code] = (availableByCode[unit.product.code] || 0) + 1;
      });
      
      // Проверяем, есть ли хотя бы один экземпляр каждого артикула
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
      fetchCashDay();
      if (cashDay) fetchEvents(cashDay.id);
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
      fetchCashDay();
      if (cashDay) fetchEvents(cashDay.id);
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
      <CashHeader cashDay={cashDay} onOpenCashDay={handleOpenCashDay} />
      
      {!cashDay ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="mb-2">Нет открытой кассовой смены</p>
          <button
            onClick={handleOpenCashDay}
            className="bg-green-600 text-white px-4 py-1 rounded text-sm"
          >
            Открыть смену
          </button>
        </div>
      ) : (
        <div className="flex gap-6">
          <CategoryTree selectedUnit={selectedUnit} onSelectUnit={handleSelectUnit} />
          
          <div className="flex-1">
            <OperationTabs operationType={operationType} setOperationType={setOperationType} />
            
            {/* Поиск */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="relative">
                <label className="block text-sm font-medium mb-1">🔍 Быстрый поиск</label>
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
                  className="w-full border rounded px-3 py-2 text-sm"
                  autoComplete="off"
                />
                {showDropdown && searchTerm && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((unit) => (
                      <div
                        key={unit.id}
                        onClick={() => handleSelectUnit(unit)}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b text-sm"
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
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm flex justify-between items-center">
                  <span>✅ {selectedUnit.product.name} ({selectedUnit.uniqueSerialNumber})</span>
                  <button onClick={() => { setSelectedUnit(null); setSearchTerm(''); }} className="text-red-500 text-xs">✖</button>
                </div>
              )}
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