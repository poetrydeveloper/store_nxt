// src/app/admin/inventory/page.tsx
// Админ панель для управления товарами

'use client';

import { useState } from 'react';

export default function InventoryAdminPage() {
  const [serialNumber, setSerialNumber] = useState('');
  const [price, setPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string }>({});

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult({});

    try {
      const response = await fetch('/api/inventory/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serialNumber,
          price: parseFloat(price),
          cashDayId: 1, // Временно, позже будет динамически
          createdBy: 'admin',
          paymentMethod,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: data.message });
        setSerialNumber('');
        setPrice('');
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      setResult({ success: false, error: 'Ошибка соединения' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckProduct = async () => {
    if (!serialNumber) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/inventory/product/${serialNumber}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Статус: ${data.data.physicalStatus}, Разобран: ${data.data.disassemblyStatus !== 'MONOLITH' ? 'Да' : 'Нет'}` 
        });
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      setResult({ success: false, error: 'Ошибка проверки' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Управление товарами</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Продажа товара</h2>
          
          <form onSubmit={handleSell} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Серийный номер товара
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Например: TEST-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Цена продажи (руб.)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="1000"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Способ оплаты
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="CASH">Наличные</option>
                <option value="CARD">Карта</option>
                <option value="TRANSFER">Перевод</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Продажа...' : 'Продать товар'}
              </button>
              
              <button
                type="button"
                onClick={handleCheckProduct}
                disabled={loading || !serialNumber}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
              >
                Проверить товар
              </button>
            </div>
          </form>
        </div>

        {/* Результат операции */}
        {result.message && (
          <div className={`p-4 rounded-lg ${
            result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {result.message}
          </div>
        )}
        
        {result.error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            Ошибка: {result.error}
          </div>
        )}

        {/* Инструкция */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2">📝 Инструкция по тестированию:</h3>
          <p className="text-sm text-gray-700">
            1. Сначала нужно создать товар в базе данных (через Prisma Studio или прямой запрос)<br/>
            2. Используйте серийный номер существующего товара<br/>
            3. Убедитесь, что товар имеет статус IN_STORE (в магазине)<br/>
            4. Попробуйте продать его через эту форму
          </p>
        </div>
      </div>
    </div>
  );
}
