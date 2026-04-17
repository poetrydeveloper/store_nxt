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
  const [todayDay, setTodayDay] = useState<CashDay | null>(null);

  const fetchCashDays = async () => {
    const res = await fetch('/api/cash-days');
    const data = await res.json();
    if (data.success) {
      setCashDays(data.data);
      const open = data.data.find((d: CashDay) => !d.isClosed);
      setOpenDay(open || null);
      
      const today = new Date().toLocaleDateString();
      const todayCash = data.data.find((d: CashDay) => 
        new Date(d.date).toLocaleDateString() === today
      );
      setTodayDay(todayCash || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCashDays();
  }, []);

  const handleOpenOrResumeDay = async () => {
    const res = await fetch('/api/cash-days', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      fetchCashDays();
    } else {
      alert(data.error);
    }
  };

  const handleCloseDay = async () => {
    if (!confirm('Закрыть кассовую смену? После закрытия можно будет снова открыть.')) return;
    
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

  // Определяем текст кнопки
  const getButtonText = () => {
    if (!todayDay) return 'Открыть новую смену';
    if (todayDay.isClosed) return 'Возобновить смену';
    return 'Смена уже открыта';
  };

  const isButtonDisabled = openDay !== null && openDay.id === todayDay?.id;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📅 Кассовые дни</h1>

      {/* Текущая смена */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Управление сменой</h2>
        
        {openDay ? (
          <div>
            <p>📅 Смена открыта: {new Date(openDay.date).toLocaleString()}</p>
            <p>💰 Текущий итог: {openDay.total} ₽</p>
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
              onClick={handleOpenOrResumeDay}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {getButtonText()}
            </button>
          </div>
        )}
        
        {todayDay && todayDay.isClosed && !openDay && (
          <p className="text-sm text-blue-600 mt-2">
            ℹ️ Смена за сегодня была закрыта. Вы можете её возобновить.
          </p>
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
                  <span className={`px-2 py-1 rounded text-xs ${day.isClosed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
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