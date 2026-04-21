// src/app/admin/cash/components/EventsTable.tsx

'use client';

import * as XLSX from 'xlsx';

interface CashEvent {
  id: number;
  type: string;
  totalAmount: number;
  description: string;
  paymentMethod: string;
  createdAt: string;
  createdBy: string;
  items?: { productUnit: { uniqueSerialNumber: string; product: { name: string; code: string } } }[];
}

interface EventsTableProps {
  events: CashEvent[];
  cashDay: { id: number; date: string; isClosed: boolean; total: number } | null;
}

export default function EventsTable({ events, cashDay }: EventsTableProps) {
  // Сортируем события по времени (старые сверху, новые снизу)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SALE: 'Продажа',
      RETURN: 'Возврат',
      EXPENSE: 'Расход',
      INCOME: 'Доход',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      SALE: '💰',
      RETURN: '🔄',
      EXPENSE: '📉',
      INCOME: '📈',
    };
    return icons[type] || '📋';
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

  const calculateTotal = () => {
    let total = 0;
    events.forEach(event => {
      const amount = typeof event.totalAmount === 'number' ? event.totalAmount : Number(event.totalAmount);
      if (!isNaN(amount)) {
        if (event.type === 'SALE' || event.type === 'INCOME') {
          total += amount;
        } else if (event.type === 'RETURN' || event.type === 'EXPENSE') {
          total -= amount;
        }
      }
    });
    return total;
  };

  const exportToExcel = () => {
    const sheetData = [
      ['Время', 'Тип', 'Артикул', 'Товар', 'Цена', 'Сумма'],
    ];

    sortedEvents.forEach(event => {
      const item = event.items?.[0];
      const productCode = item?.productUnit?.product?.code || '';
      const productName = item?.productUnit?.product?.name || event.description || '';
      const amount = event.totalAmount;
      const price = item?.pricePerUnit || amount;
      
      sheetData.push([
        new Date(event.createdAt).toLocaleString(),
        `${getTypeIcon(event.type)} ${getTypeLabel(event.type)}`,
        productCode,
        productName,
        price.toString(),
        `${event.type === 'SALE' || event.type === 'INCOME' ? '+' : '-'}${amount} ₽`,
      ]);
    });

    const total = calculateTotal();
    sheetData.push(['', '', '', '', 'ИТОГО:', `${total} ₽`]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    ws['!cols'] = [
      { wch: 20 }, // Время
      { wch: 12 }, // Тип
      { wch: 15 }, // Артикул
      { wch: 50 }, // Товар
      { wch: 12 }, // Цена
      { wch: 15 }, // Сумма
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Продажи');

    const date = cashDay 
      ? new Date(cashDay.date).toLocaleDateString('ru-RU').replace(/\./g, '-')
      : new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
    XLSX.writeFile(wb, `продажи_за_${date}.xlsx`);
  };

  const total = calculateTotal();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-1.5 bg-gray-50 border-b flex justify-between items-center">
        <div className="text-xs font-medium">
          📋 Операции за смену
          {cashDay && (
            <span className="text-gray-400 ml-2">
              от {new Date(cashDay.date).toLocaleDateString()}
            </span>
          )}
        </div>
        {events.length > 0 && (
          <button
            onClick={exportToExcel}
            className="text-xs bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700 flex items-center gap-1"
          >
            📎 Выгрузить в Excel
          </button>
        )}
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="border-b">
              <th className="px-2 py-1 text-left">Время</th>
              <th className="px-2 py-1 text-left">Тип</th>
              <th className="px-2 py-1 text-left">Артикул</th>
              <th className="px-2 py-1 text-left">Товар</th>
              <th className="px-2 py-1 text-left">Цена</th>
              <th className="px-2 py-1 text-left">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map((event) => {
              const item = event.items?.[0];
              const productCode = item?.productUnit?.product?.code || '';
              const productName = item?.productUnit?.product?.name || event.description || '';
              const amount = event.totalAmount;
              const price = item?.pricePerUnit || amount;
              
              return (
                <tr key={event.id} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-1 text-xs whitespace-nowrap">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-2 py-1">
                    <span className={getTypeColor(event.type)}>
                      {getTypeIcon(event.type)} {getTypeLabel(event.type)}
                    </span>
                  </td>
                  <td className="px-2 py-1 font-mono text-xs">
                    {productCode || '—'}
                  </td>
                  <td className="px-2 py-1 text-xs truncate max-w-[200px]">
                    {productName}
                  </td>
                  <td className="px-2 py-1 text-xs whitespace-nowrap">
                    {typeof price === 'number' ? price.toLocaleString() : price} ₽
                  </td>
                  <td className={`px-2 py-1 font-medium whitespace-nowrap ${
                    event.type === 'SALE' || event.type === 'INCOME' ? 'text-green-600' : 
                    event.type === 'RETURN' || event.type === 'EXPENSE' ? 'text-red-600' : ''
                  }`}>
                    {event.type === 'SALE' || event.type === 'INCOME' ? '+' : '-'}
                    {typeof amount === 'number' ? amount.toLocaleString() : amount} ₽
                  </td>
                </tr>
              );
            })}
            
            {events.length > 0 && (
              <tr className="border-t bg-gray-50 font-semibold">
                <td colSpan={5} className="px-2 py-1 text-right text-xs">
                  ИТОГО:
                </td>
                <td className={`px-2 py-1 text-xs font-bold ${
                  total >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {total >= 0 ? '+' : ''}{typeof total === 'number' ? total.toLocaleString() : total} ₽
                </td>
              </tr>
            )}
            
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-2 py-3 text-center text-gray-500 text-xs">
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