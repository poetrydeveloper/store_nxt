'use client';

import { useState } from 'react';

interface SellFormProps {
  onSell: (serialNumber: string, price: number, paymentMethod: string) => Promise<void>;
}

export default function SellForm({ onSell }: SellFormProps) {
  const [serialNumber, setSerialNumber] = useState('');
  const [price, setPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult({});

    try {
      await onSell(serialNumber, parseFloat(price), paymentMethod);
      setResult({ success: true, message: 'Товар продан' });
      setSerialNumber('');
      setPrice('');
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckProduct = async () => {
    if (!serialNumber) return;
    // Логика проверки
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">💰 Продажа товара</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          placeholder="Серийный номер товара *"
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Цена продажи (руб.) *"
          className="w-full border rounded-lg px-3 py-2"
          required
          min="0"
          step="0.01"
        />
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="CASH">Наличные</option>
          <option value="CARD">Карта</option>
          <option value="TRANSFER">Перевод</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
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