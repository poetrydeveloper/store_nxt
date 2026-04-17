// src/app/admin/inventory/components/ManualReceiptForm.tsx

'use client';

import { useState } from 'react';

interface Product {
  id: number;
  code: string;
  name: string;
}

interface ManualReceiptFormProps {
  products: Product[];
  onManualReceipt: (data: { productId: number; purchasePrice: number }) => Promise<void>;
}

// Генератор серийного номера
const generateSerialNumber = (productCode: string): string => {
  const date = new Date();
  const timestamp = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0') +
                   date.getHours().toString().padStart(2, '0') +
                   date.getMinutes().toString().padStart(2, '0') +
                   date.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${productCode}-MANUAL-${timestamp}-${random}`;
};

export default function ManualReceiptForm({ products, onManualReceipt }: ManualReceiptFormProps) {
  const [form, setForm] = useState({
    productId: '',
    purchasePrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [generatedSerial, setGeneratedSerial] = useState<string | null>(null);

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      const serial = generateSerialNumber(product.code);
      setGeneratedSerial(serial);
    } else {
      setGeneratedSerial(null);
    }
    setForm({ ...form, productId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.productId) {
      alert('Выберите товар');
      return;
    }
    
    if (!form.purchasePrice || parseFloat(form.purchasePrice) <= 0) {
      alert('Укажите цену закупки');
      return;
    }

    setLoading(true);

    try {
      await onManualReceipt({
        productId: parseInt(form.productId),
        purchasePrice: parseFloat(form.purchasePrice),
      });
      
      setForm({ productId: '', purchasePrice: '' });
      setGeneratedSerial(null);
      alert('Товар принят на склад');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">📥 Ручной приём товара</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Выберите товар *</label>
          <select
            value={form.productId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Выберите товар</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {generatedSerial && (
          <div className="p-2 bg-gray-50 rounded text-sm">
            <span className="text-gray-500">🔢 Серийный номер (сгенерирован):</span>
            <br />
            <span className="font-mono text-xs break-all">{generatedSerial}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Цена закупки (руб.) *</label>
          <input
            type="number"
            placeholder="Например: 50000"
            value={form.purchasePrice}
            onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
            className="w-full border rounded px-3 py-2"
            step="0.01"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.productId || !form.purchasePrice}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Обработка...' : 'Принять товар'}
        </button>
      </form>
    </div>
  );
}