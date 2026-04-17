// src/components/admin/Header.tsx

'use client';

import { useState, useEffect } from 'react';

interface CashDay {
  id: number;
  isClosed: boolean;
  total: number;
}

export default function Header() {
  const [openCashDay, setOpenCashDay] = useState<CashDay | null>(null);

  useEffect(() => {
    fetchOpenCashDay();
  }, []);

  const fetchOpenCashDay = async () => {
    const res = await fetch('/api/cash-days');
    const data = await res.json();
    if (data.success) {
      const open = data.data.find((d: CashDay) => !d.isClosed);
      setOpenCashDay(open || null);
    }
  };

  return (
    <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="text-gray-500">
          📅 {new Date().toLocaleDateString('ru-RU')}
        </div>
        {openCashDay ? (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            ✅ Смена №{openCashDay.id} открыта
          </div>
        ) : (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            ⚠️ Нет открытой смены
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-gray-600 hover:text-gray-900">
          🔔
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
            A
          </div>
          <span className="text-sm font-medium">Администратор</span>
        </div>
      </div>
    </header>
  );
}