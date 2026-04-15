// src/app/admin/disassembly/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface Scenario {
  id: number;
  name: string;
  parentProductCode: string;
  childProductCodes: string[];
  partsCount: number;
  isActive: boolean;
}

export default function DisassemblyPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    parentProductCode: '',
    childProductCodes: '',
    partsCount: '1',
    isActive: true,
  });

  const fetchScenarios = async () => {
    const res = await fetch('/api/disassembly-scenarios');
    const data = await res.json();
    if (data.success) setScenarios(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const childCodes = form.childProductCodes.split(',').map(c => c.trim());

    const res = await fetch('/api/disassembly-scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        parentProductCode: form.parentProductCode,
        childProductCodes: childCodes,
        partsCount: parseInt(form.partsCount),
        isActive: form.isActive,
      }),
    });

    if (res.ok) {
      setForm({ name: '', parentProductCode: '', childProductCodes: '', partsCount: '1', isActive: true });
      fetchScenarios();
    }
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    const res = await fetch(`/api/disassembly-scenarios?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...scenario, isActive: !currentActive }),
    });

    if (res.ok) fetchScenarios();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить сценарий?')) return;
    const res = await fetch(`/api/disassembly-scenarios?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchScenarios();
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Сценарии разборки/сборки</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма создания */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Создать сценарий</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Название сценария *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Артикул родительского товара (коллекции) *"
              value={form.parentProductCode}
              onChange={(e) => setForm({ ...form, parentProductCode: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Артикулы частей (через запятую)"
              value={form.childProductCodes}
              onChange={(e) => setForm({ ...form, childProductCodes: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Количество частей *"
              value={form.partsCount}
              onChange={(e) => setForm({ ...form, partsCount: e.target.value })}
              className="w-full border rounded px-3 py-2"
              min="1"
              required
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Активен
            </label>
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Создать сценарий
            </button>
          </form>
        </div>

        {/* Список сценариев */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Название</th>
                <th className="px-4 py-2 text-left">Родитель</th>
                <th className="px-4 py-2 text-left">Частей</th>
                <th className="px-4 py-2 text-left">Статус</th>
                <th className="px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">{s.id}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2 font-mono text-sm">{s.parentProductCode}</td>
                  <td className="px-4 py-2">{s.partsCount}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {s.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => toggleActive(s.id, s.isActive)} className="text-blue-600 mr-2">
                      {s.isActive ? '🔴' : '🟢'}
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Инструкция */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">📖 Как использовать:</h3>
        <p className="text-sm">1. Создайте сценарий разборки коллекции<br/>
        2. На странице склада выберите товар и нажмите "Разобрать"<br/>
        3. Появятся дочерние товары, которые можно продавать отдельно<br/>
        4. При сборке все части должны быть в наличии</p>
      </div>
    </div>
  );
}