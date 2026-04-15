// src/app/admin/cash-days/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface CashDay {
  id: number;
  date: string;
  isClosed: boolean;
  total: number;
}

export default function CashDaysPage() {
  const [cashDays, setCashDays] = useState<CashDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDay, setOpenDay] = useState<CashDay | null>(null);

  const fetchCashDays = async () => {
    const res = await fetch('/api/cash-days');
    const data = await res.json();
    if (data.success) {
      setCashDays(data.data);
      const open = data.data.find((d: CashDay) => !d.isClosed);
      setOpenDay(open || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCashDays();
  }, []);

  const handleOpenDay = async () => {
    const res = await fetch('/api/cash-days', { method: 'POST' });
    if (res.ok) {
      fetchCashDays();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const handleCloseDay = async () => {
    const res = await fetch('/api/cash-days?action=close', { method: 'PUT' });
    if (res.ok) {
      const data = await res.json();
      alert(data.message);
      fetchCashDays();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📅 Кассовые дни</h1>

      {/* Текущая смена */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Текущая смена</h2>
        {openDay ? (
          <div>
            <p>Открыта: {new Date(openDay.date).toLocaleString()}</p>
            <p>Текущий итог: {openDay.total} ₽</p>
            <button
              onClick={handleCloseDay}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Закрыть смену
            </button>
          </div>
        ) : (
          <div>
            <p>Нет открытой смены</p>
            <button
              onClick={handleOpenDay}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Открыть смену
            </button>
          </div>
        )}
      </div>

      {/* История смен */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b">История смен</h2>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Дата</th>
              <th className="px-4 py-2 text-left">Итог</th>
              <th className="px-4 py-2 text-left">Статус</th>
            </tr>
          </thead>
          <tbody>
            {cashDays.map((day) => (
              <tr key={day.id} className="border-t">
                <td className="px-4 py-2">{new Date(day.date).toLocaleString()}</td>
                <td className="px-4 py-2">{day.total} ₽</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${day.isClosed ? 'bg-gray-100' : 'bg-green-100 text-green-800'}`}>
                    {day.isClosed ? 'Закрыта' : 'Открыта'}
                  </span>
                 </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}