// src/app/admin/suppliers/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  });

  const fetchSuppliers = async () => {
    const res = await fetch('/api/suppliers');
    const data = await res.json();
    if (data.success) setSuppliers(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    if (res.ok) {
      setForm({ name: '', contactPerson: '', phone: '', email: '', address: '' });
      fetchSuppliers();
    }
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Поставщики</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма создания */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Добавить поставщика</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Название компании *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Контактное лицо"
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Телефон"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <textarea
              placeholder="Адрес"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={2}
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Создать
            </button>
          </form>
        </div>
        
        {/* Список поставщиков */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Название</th>
                <th className="px-4 py-2 text-left">Контакт</th>
                <th className="px-4 py-2 text-left">Телефон</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">{s.id}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.contactPerson || '—'}</td>
                  <td className="px-4 py-2">{s.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}