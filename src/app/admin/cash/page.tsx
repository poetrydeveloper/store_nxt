// src/app/admin/cash/page.tsx

'use client';

import { useEffect, useState } from 'react';

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
}

export default function CashPage() {
  const [cashDays, setCashDays] = useState<CashDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CashDay | null>(null);
  const [events, setEvents] = useState<CashEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: 'SALE',
    totalAmount: '',
    description: '',
    paymentMethod: 'CASH',
  });

  const fetchCashDays = async () => {
    const res = await fetch('/api/cash-days');
    const data = await res.json();
    if (data.success) {
      setCashDays(data.data);
      const open = data.data.find((d: CashDay) => !d.isClosed);
      if (open) setSelectedDay(open);
    }
    setLoading(false);
  };

  const fetchEvents = async (cashDayId: number) => {
    const res = await fetch(`/api/cash-events?cashDayId=${cashDayId}`);
    const data = await res.json();
    if (data.success) setEvents(data.data);
  };

  useEffect(() => {
    fetchCashDays();
  }, []);

  useEffect(() => {
    if (selectedDay) {
      fetchEvents(selectedDay.id);
    }
  }, [selectedDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDay) {
      alert('Сначала откройте смену');
      return;
    }

    const res = await fetch('/api/cash-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        totalAmount: parseFloat(form.totalAmount),
        cashDayId: selectedDay.id,
        createdBy: 'admin',
        items: [],
      }),
    });

    if (res.ok) {
      setForm({ type: 'SALE', totalAmount: '', description: '', paymentMethod: 'CASH' });
      fetchEvents(selectedDay.id);
      fetchCashDays();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SALE: '💰 Продажа',
      RETURN: '🔄 Возврат',
      EXPENSE: '📉 Расход',
      INCOME: '📈 Доход',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SALE: 'text-green-600',
      RETURN: 'text-red-600',
      EXPENSE: 'text-orange-600',
      INCOME: 'text-blue-600',
    };
    return colors[type] || 'text-gray-600';
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">💵 Касса</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка - смены и форма */}
        <div className="space-y-6">
          {/* Выбор смены */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Кассовая смена</h2>
            <select
              value={selectedDay?.id || ''}
              onChange={(e) => {
                const day = cashDays.find(d => d.id === parseInt(e.target.value));
                setSelectedDay(day || null);
              }}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Выберите смену</option>
              {cashDays.map((day) => (
                <option key={day.id} value={day.id}>
                  {new Date(day.date).toLocaleString()} - {day.isClosed ? 'Закрыта' : 'Открыта'} ({day.total} ₽)
                </option>
              ))}
            </select>
            {selectedDay && !selectedDay.isClosed && (
              <p className="text-sm text-green-600 mt-2">✅ Смена открыта. Можно добавлять операции.</p>
            )}
            {selectedDay && selectedDay.isClosed && (
              <p className="text-sm text-red-600 mt-2">❌ Смена закрыта. Операции недоступны.</p>
            )}
          </div>

          {/* Форма добавления операции */}
          {selectedDay && !selectedDay.isClosed && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">➕ Добавить операцию</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="SALE">💰 Продажа</option>
                  <option value="RETURN">🔄 Возврат</option>
                  <option value="EXPENSE">📉 Расход</option>
                  <option value="INCOME">📈 Доход</option>
                </select>

                <input
                  type="number"
                  placeholder="Сумма *"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                  step="0.01"
                />

                <input
                  type="text"
                  placeholder="Описание"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />

                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="CASH">Наличные</option>
                  <option value="CARD">Карта</option>
                  <option value="TRANSFER">Перевод</option>
                </select>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Добавить операцию
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Правая колонка - список операций */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">📋 Операции</h2>
            <p className="text-sm text-gray-500">
              {selectedDay ? `Смена от ${new Date(selectedDay.date).toLocaleString()}` : 'Выберите смену'}
            </p>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">Тип</th>
                  <th className="px-4 py-2 text-left text-sm">Сумма</th>
                  <th className="px-4 py-2 text-left text-sm">Способ</th>
                  <th className="px-4 py-2 text-left text-sm">Описание</th>
                  <th className="px-4 py-2 text-left text-sm">Время</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t text-sm">
                    <td className="px-4 py-2">
                      <span className={getTypeColor(event.type)}>
                        {getTypeLabel(event.type)}
                      </span>
                    </td>
                    <td className={`px-4 py-2 font-semibold ${event.type === 'SALE' || event.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {event.type === 'SALE' || event.type === 'INCOME' ? '+' : '-'}{event.totalAmount} ₽
                    </td>
                    <td className="px-4 py-2">{event.paymentMethod}</td>
                    <td className="px-4 py-2">{event.description || '—'}</td>
                    <td className="px-4 py-2 text-xs">{new Date(event.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Нет операций
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Итог */}
      {selectedDay && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-lg font-semibold">
            Итог смены: {selectedDay.total} ₽
          </p>
        </div>
      )}
    </div>
  );
}