// src/app/admin/cash/components/CashHeader.tsx

'use client';

import { useState, useEffect } from 'react';

interface CashDay {
  id: number;
  date: string;
  isClosed: boolean;
  total: number;
}

interface CashHeaderProps {
  cashDay: CashDay | null;
  onOpenCashDay: () => void;
  onRefresh?: () => void;
}

export default function CashHeader({ cashDay, onOpenCashDay, onRefresh }: CashHeaderProps) {
  const [currentCashDay, setCurrentCashDay] = useState<CashDay | null>(cashDay);

  useEffect(() => {
    setCurrentCashDay(cashDay);
  }, [cashDay]);

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      const res = await fetch('/api/cash-days');
      const data = await res.json();
      if (data.success) {
        const open = data.data.find((d: CashDay) => !d.isClosed);
        setCurrentCashDay(open || null);
      }
    }
  };

  return (
    <div className="flex justify-between items-center mb-3 pb-1 border-b">
      <h1 className="text-lg font-bold">💵 Касса</h1>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-gray-500">📅 {new Date().toLocaleDateString('ru-RU')}</span>
        {currentCashDay ? (
          <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full text-xs">
            ✅ Смена №{currentCashDay.id}
          </span>
        ) : (
          <button
            onClick={onOpenCashDay}
            className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs hover:bg-yellow-200"
          >
            ⚠️ Нет смены
          </button>
        )}
        <span className="font-semibold">
          Итог: {currentCashDay?.total.toLocaleString() || 0} ₽
        </span>
        <button
          onClick={handleRefresh}
          className="text-gray-400 hover:text-gray-600 text-xs"
          title="Обновить"
        >
          🔄
        </button>
      </div>
    </div>
  );
}