'use client';

import { useState } from 'react';

interface Product {
  id: number;
  code: string;
  name: string;
}

interface ManualReceiptFormProps {
  products: Product[];
  onManualReceipt: (data: { productId: number; uniqueSerialNumber: string; acceptedBy: string; comment: string; purchasePrice?: number }) => Promise<void>;
}

export default function ManualReceiptForm({ products, onManualReceipt }: ManualReceiptFormProps) {
  const [form, setForm] = useState({
    productId: '',
    uniqueSerialNumber: '',
    purchasePrice: '',
    acceptedBy: '',
    comment: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onManualReceipt({
        productId: parseInt(form.productId),
        uniqueSerialNumber: form.uniqueSerialNumber,
        acceptedBy: form.acceptedBy,
        comment: form.comment,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
      });
      setForm({ productId: '', uniqueSerialNumber: '', purchasePrice: '', acceptedBy: '', comment: '' });
      alert('Товар принят');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">📥 Ручной приём товара</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={form.productId}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Выберите товар</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Уникальный серийный номер *"
          value={form.uniqueSerialNumber}
          onChange={(e) => setForm({ ...form, uniqueSerialNumber: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="number"
          placeholder="Цена закупки (руб.) - опционально"
          value={form.purchasePrice}
          onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
          className="w-full border rounded px-3 py-2"
          step="0.01"
        />
        <input
          type="text"
          placeholder="Принял (ФИО) *"
          value={form.acceptedBy}
          onChange={(e) => setForm({ ...form, acceptedBy: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          placeholder="Комментарий"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows={2}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          {loading ? 'Обработка...' : 'Принять товар'}
        </button>
      </form>
    </div>
  );
}