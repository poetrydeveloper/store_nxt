// src/app/admin/customers/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    balance: '0',
  });

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    if (data.success) setCustomers(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingCustomer ? `/api/customers?id=${editingCustomer.id}` : '/api/customers';
    const method = editingCustomer ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        balance: parseFloat(form.balance),
      }),
    });
    
    if (res.ok) {
      setForm({ name: '', phone: '', email: '', address: '', balance: '0' });
      setEditingCustomer(null);
      fetchCustomers();
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      balance: customer.balance.toString(),
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить покупателя?')) return;
    
    const res = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchCustomers();
  };

  const handleCancel = () => {
    setEditingCustomer(null);
    setForm({ name: '', phone: '', email: '', address: '', balance: '0' });
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Покупатели</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">
            {editingCustomer ? 'Редактировать покупателя' : 'Добавить покупателя'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Имя *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
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
            <input
              type="number"
              placeholder="Баланс (руб.)"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              className="w-full border rounded px-3 py-2"
              step="0.01"
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {editingCustomer ? 'Обновить' : 'Создать'}
              </button>
              {editingCustomer && (
                <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  Отмена
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Список */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Имя</th>
                <th className="px-4 py-2 text-left">Телефон</th>
                <th className="px-4 py-2 text-left">Баланс</th>
                <th className="px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.phone || '—'}</td>
                  <td className={`px-4 py-2 ${c.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {c.balance} ₽
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleEdit(c)} className="text-blue-600 mr-2">✏️</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}