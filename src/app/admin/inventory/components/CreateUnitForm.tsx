'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: number;
  code: string;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface CreateUnitFormProps {
  products: Product[];
  suppliers: Supplier[];
  onCreateUnit: (data: { productId: number; uniqueSerialNumber: string; purchasePrice?: number; supplierId?: number }) => Promise<void>;
}

export default function CreateUnitForm({ products, suppliers, onCreateUnit }: CreateUnitFormProps) {
  const [form, setForm] = useState({
    productId: '',
    uniqueSerialNumber: '',
    purchasePrice: '',
    supplierId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreateUnit({
        productId: parseInt(form.productId),
        uniqueSerialNumber: form.uniqueSerialNumber,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
        supplierId: form.supplierId ? parseInt(form.supplierId) : undefined,
      });
      setForm({ productId: '', uniqueSerialNumber: '', purchasePrice: '', supplierId: '' });
      alert('Экземпляр товара добавлен на склад');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">📦 Добавить экземпляр на склад</h2>
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
          placeholder="Цена закупки (руб.)"
          value={form.purchasePrice}
          onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
          className="w-full border rounded px-3 py-2"
          step="0.01"
        />
        <select
          value={form.supplierId}
          onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Выберите поставщика</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Добавить на склад
        </button>
      </form>
    </div>
  );
}