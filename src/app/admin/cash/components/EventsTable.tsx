// src/app/admin/cash/components/EventsTable.tsx

'use client';

interface CashEvent {
  id: number;
  type: string;
  totalAmount: number;
  description: string;
  paymentMethod: string;
  createdAt: string;
  createdBy: string;
  items?: { productUnit: { uniqueSerialNumber: string; product: { name: string } } }[];
}

interface EventsTableProps {
  events: CashEvent[];
  cashDay: CashDay | null;
}

export default function EventsTable({ events, cashDay }: EventsTableProps) {
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-1.5 bg-gray-50 border-b text-xs font-medium">
        📋 Операции за смену
      </div>
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-2 py-1 text-left">Время</th>
              <th className="px-2 py-1 text-left">Тип</th>
              <th className="px-2 py-1 text-left">Товар</th>
              <th className="px-2 py-1 text-left">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t">
                <td className="px-2 py-1 text-xs">{new Date(event.createdAt).toLocaleTimeString()}</td>
                <td className="px-2 py-1">
                  <span className={getTypeColor(event.type)}>{getTypeLabel(event.type)}</span>
                </td>
                <td className="px-2 py-1 text-xs truncate max-w-[150px]">
                  {event.items?.[0]?.productUnit?.product?.name || event.description || '—'}
                </td>
                <td className={`px-2 py-1 font-medium ${event.type === 'SALE' ? 'text-green-600' : event.type === 'RETURN' ? 'text-red-600' : ''}`}>
                  {event.type === 'SALE' ? '+' : event.type === 'RETURN' ? '-' : ''}{event.totalAmount.toLocaleString()} ₽
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="px-2 py-2 text-center text-gray-500 text-xs">
                  Нет операций
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}