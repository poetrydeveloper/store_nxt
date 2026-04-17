// src/app/admin/inventory/components/SellForm.tsx

'use client';

import { useState, useEffect } from 'react';

interface ProductUnit {
  id: number;
  uniqueSerialNumber: string;
  product: { id: number; code: string; name: string };
  purchasePrice?: number;
  physicalStatus: string;
  status: string;
}

interface CashDay {
  id: number;
  date: string;
  isClosed: boolean;
}

interface SellFormProps {
  onSell: (serialNumber: string, price: number, paymentMethod: string, cashDayId: number) => Promise<void>;
}

export default function SellForm({ onSell }: SellFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit | null>(null);
  const [price, setPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string }>({});
  const [availableUnits, setAvailableUnits] = useState<ProductUnit[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [openCashDay, setOpenCashDay] = useState<CashDay | null>(null);
  const [checkingCashDay, setCheckingCashDay] = useState(true);

  // Проверяем открытый кассовый день
  const checkOpenCashDay = async () => {
    setCheckingCashDay(true);
    const res = await fetch('/api/cash-days');
    const data = await res.json();
    if (data.success) {
      const openDay = data.data.find((d: CashDay) => !d.isClosed);
      setOpenCashDay(openDay || null);
    }
    setCheckingCashDay(false);
  };

  // Загружаем доступные товары
  const fetchAvailableUnits = async () => {
    const res = await fetch('/api/product-units');
    const data = await res.json();
    if (data.success) {
      const available = data.data.filter((u: ProductUnit) => 
        u.physicalStatus === 'IN_STORE' && (u.status === 'RECEIVED' || u.status === 'IN_STORE')
      );
      setAvailableUnits(available);
    }
  };

  useEffect(() => {
    checkOpenCashDay();
    fetchAvailableUnits();
  }, []);

  // Открыть новую смену
  const handleOpenCashDay = async () => {
    const res = await fetch('/api/cash-days', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setOpenCashDay(data.data);
      alert('Кассовая смена открыта!');
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  // Фильтрация товаров по поиску
  const filteredUnits = availableUnits.filter(unit =>
    unit.uniqueSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUnit = (unit: ProductUnit) => {
    setSelectedUnit(unit);
    setSearchTerm(`${unit.product.name} (${unit.uniqueSerialNumber})`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!openCashDay) {
      setResult({ success: false, error: 'Нет открытой кассовой смены. Сначала откройте смену.' });
      return;
    }
    
    if (!selectedUnit) {
      setResult({ success: false, error: 'Выберите товар для продажи' });
      return;
    }

    setLoading(true);
    setResult({});

    try {
      await onSell(selectedUnit.uniqueSerialNumber, parseFloat(price), paymentMethod, openCashDay.id);
      setResult({ success: true, message: `Товар продан. Смена №${openCashDay.id}` });
      setSelectedUnit(null);
      setSearchTerm('');
      setPrice('');
      fetchAvailableUnits();
      checkOpenCashDay(); // Обновляем информацию о смене
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (checkingCashDay) {
    return <div className="bg-white rounded-lg shadow p-6 text-center">Проверка кассовой смены...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">💰 Продажа товара</h2>
      
      {/* Статус кассовой смены */}
      <div className={`mb-4 p-3 rounded-lg ${openCashDay ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        {openCashDay ? (
          <div className="flex justify-between items-center">
            <span>✅ Смена №{openCashDay.id} открыта с {new Date(openCashDay.date).toLocaleString()}</span>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span>⚠️ Нет открытой кассовой смены</span>
            <button
              type="button"
              onClick={handleOpenCashDay}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Открыть смену
            </button>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Поиск товара</label>
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
            className="w-full border rounded-lg px-3 py-2"
            autoComplete="off"
            disabled={!openCashDay}
          />
          
          {showDropdown && searchTerm && filteredUnits.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredUnits.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => handleSelectUnit(unit)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="font-medium">{unit.product.name}</div>
                  <div className="text-sm text-gray-500">
                    Серийный номер: {unit.uniqueSerialNumber} | Артикул: {unit.product.code}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedUnit && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium">Выбранный товар:</div>
            <div className="text-sm">{selectedUnit.product.name}</div>
            <div className="text-sm text-gray-600">Серийный номер: {selectedUnit.uniqueSerialNumber}</div>
            <button
              type="button"
              onClick={() => {
                setSelectedUnit(null);
                setSearchTerm('');
              }}
              className="text-xs text-blue-600 mt-1 hover:underline"
            >
              Изменить
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Цена продажи (руб.)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1000"
            className="w-full border rounded-lg px-3 py-2"
            required
            min="0"
            step="0.01"
            disabled={!selectedUnit || !openCashDay}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Способ оплаты</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            disabled={!selectedUnit || !openCashDay}
          >
            <option value="CASH">Наличные</option>
            <option value="CARD">Карта</option>
            <option value="TRANSFER">Перевод</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedUnit || !openCashDay}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Продажа...' : 'Продать товар'}
        </button>
      </form>
      
      {result.message && (
        <div className={`mt-4 p-3 rounded-lg ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {result.message || result.error}
        </div>
      )}
    </div>
  );
}