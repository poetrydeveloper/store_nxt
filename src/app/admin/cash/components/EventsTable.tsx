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
      if (event.type === 'SALE' || event.type === 'INCOME') {
        total += event.totalAmount;
      } else if (event.type === 'RETURN' || event.type === 'EXPENSE') {
        total -= event.totalAmount;
      }
    });
    return total;
  };

  const exportToExcel = () => {
    // Подготовка данных для Excel
    const sheetData = [
      ['Время', 'Тип', 'Артикул', 'Товар', 'Цена', 'Сумма'],
    ];

    events.forEach(event => {
      const item = event.items?.[0];
      const productCode = item?.productUnit?.product?.code || '';
      const productName = item?.productUnit?.product?.name || event.description || '';
      const amount = event.totalAmount;
      const price = item?.pricePerUnit || amount;
      
      sheetData.push([
        new Date(event.createdAt).toLocaleTimeString(),
        `${getTypeIcon(event.type)} ${getTypeLabel(event.type)}`,
        productCode,
        productName,
        price.toString(),
        `${event.type === 'SALE' || event.type === 'INCOME' ? '+' : '-'}${amount} ₽`,
      ]);
    });

    // Добавляем итоговую строку
    const total = calculateTotal();
    sheetData.push(['', '', '', '', 'ИТОГО:', `${total} ₽`]);

    // Создаём workbook и worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Настройка ширины колонок
    ws['!cols'] = [
      { wch: 10 }, // Время
      { wch: 12 }, // Тип
      { wch: 15 }, // Артикул
      { wch: 50 }, // Товар
      { wch: 12 }, // Цена
      { wch: 15 }, // Сумма
    ];

    // Форматирование заголовка (жирный шрифт)
    for (let i = 0; i < sheetData[0].length; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!ws[cellAddress]) ws[cellAddress] = {};
      ws[cellAddress].s = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "E0E0E0" } }
      };
    }

    // Форматирование итоговой строки
    const lastRow = sheetData.length - 1;
    for (let i = 4; i < 6; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: lastRow, c: i });
      if (!ws[cellAddress]) ws[cellAddress] = {};
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "FFFF00" } }
      };
    }

    // Добавляем worksheet в workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Продажи');

    // Формируем название файла
    const date = cashDay 
      ? new Date(cashDay.date).toLocaleDateString('ru-RU').replace(/\./g, '-')
      : new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
    const fileName = `продажи_за_${date}.xlsx`;

    // Сохраняем файл
    XLSX.writeFile(wb, fileName);
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
            {events.map((event) => {
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
                    {price.toLocaleString()} ₽
                  </td>
                  <td className={`px-2 py-1 font-medium whitespace-nowrap ${
                    event.type === 'SALE' || event.type === 'INCOME' ? 'text-green-600' : 
                    event.type === 'RETURN' || event.type === 'EXPENSE' ? 'text-red-600' : ''
                  }`}>
                    {event.type === 'SALE' || event.type === 'INCOME' ? '+' : '-'}{amount.toLocaleString()} ₽
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
                  {total >= 0 ? '+' : ''}{total.toLocaleString()} ₽
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