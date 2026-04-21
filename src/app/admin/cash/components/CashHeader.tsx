// src/app/admin/cash/components/CashHeader.tsx

'use client';

interface CashDay {
  id: number;
  date: string;
  isClosed: boolean;
  total: number;
}

interface CashHeaderProps {
  cashDay: CashDay | null;
  onOpenCashDay: () => void;
}

export default function CashHeader({ cashDay, onOpenCashDay }: CashHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4 pb-2 border-b">
      <h1 className="text-xl font-bold">💵 Касса</h1>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500">📅 {new Date().toLocaleDateString('ru-RU')}</span>
        {cashDay ? (
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
            ✅ Смена №{cashDay.id} открыта
          </span>
        ) : (
          <button
            onClick={onOpenCashDay}
            className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs hover:bg-yellow-200"
          >
            ⚠️ Нет открытой смены
          </button>
        )}
        <span className="font-semibold">
          Итог: {cashDay?.total.toLocaleString() || 0} ₽
        </span>
      </div>
    </div>
  );
}