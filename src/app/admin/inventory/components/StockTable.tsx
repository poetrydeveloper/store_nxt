interface ProductUnit {
  id: number;
  uniqueSerialNumber: string;
  purchasePrice?: number;
  physicalStatus: string;
  product: { name: string };
}

interface StockTableProps {
  units: ProductUnit[];
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    IN_STORE: 'bg-green-100 text-green-800',
    SOLD: 'bg-blue-100 text-blue-800',
    LOST: 'bg-red-100 text-red-800',
    IN_DISASSEMBLED: 'bg-yellow-100 text-yellow-800',
    IN_COLLECTED: 'bg-purple-100 text-purple-800',
    ABSORBED: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    IN_STORE: 'В магазине',
    SOLD: 'Продан',
    LOST: 'Потерян',
    IN_DISASSEMBLED: 'Разобран',
    IN_COLLECTED: 'В коллекции',
    ABSORBED: 'Поглощён',
  };
  return labels[status] || status;
};

export default function StockTable({ units }: StockTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold">📋 Товары на складе</h2>
        <p className="text-sm text-gray-500">Всего: {units.length} экземпляров</p>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-sm">Серийный номер</th>
              <th className="px-4 py-2 text-left text-sm">Товар</th>
              <th className="px-4 py-2 text-left text-sm">Статус</th>
              <th className="px-4 py-2 text-left text-sm">Цена закупки</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id} className="border-t text-sm">
                <td className="px-4 py-2 font-mono">{unit.uniqueSerialNumber}</td>
                <td className="px-4 py-2">{unit.product.name}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(unit.physicalStatus)}`}>
                    {getStatusLabel(unit.physicalStatus)}
                  </span>
                </td>
                <td className="px-4 py-2">{unit.purchasePrice ? `${unit.purchasePrice} ₽` : '—'}</td>
              </tr>
            ))}
            {units.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Нет товаров на складе. Добавьте первый экземпляр!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}