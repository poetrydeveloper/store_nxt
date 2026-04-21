// src/app/admin/inventory/components/StockTable.tsx

interface ProductUnit {
  id: number;
  uniqueSerialNumber: string;
  purchasePrice?: number;
  physicalStatus: string;
  disassemblyStatus: string;
  status: string;
  product: { id: number; code: string; name: string };
}

interface StockTableProps {
  units: ProductUnit[];
}

const getStatusColor = (physicalStatus: string, disassemblyStatus: string, status: string) => {
  if (status === 'IN_REQUEST') return 'bg-yellow-100 text-yellow-800';
  if (physicalStatus === 'IN_STORE' && (status === 'RECEIVED' || status === 'IN_STORE')) return 'bg-green-100 text-green-800';
  if (physicalStatus === 'SOLD') return 'bg-blue-100 text-blue-800';
  if (physicalStatus === 'LOST') return 'bg-red-100 text-red-800';
  if (physicalStatus === 'IN_DISASSEMBLED') return 'bg-purple-100 text-purple-800';
  if (physicalStatus === 'IN_COLLECTED' && disassemblyStatus === 'PARTIAL') return 'bg-orange-100 text-orange-800';
  if (physicalStatus === 'IN_COLLECTED' && disassemblyStatus === 'RESTORED') return 'bg-teal-100 text-teal-800';
  return 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (physicalStatus: string, disassemblyStatus: string, status: string) => {
  if (status === 'IN_REQUEST') return '⏳ Заказан (не принят)';
  if (physicalStatus === 'IN_STORE' && (status === 'RECEIVED' || status === 'IN_STORE')) return '📦 В магазине';
  if (physicalStatus === 'SOLD') return '💰 Продан';
  if (physicalStatus === 'LOST') return '❌ Потерян';
  if (physicalStatus === 'IN_DISASSEMBLED') return '🔧 Разобран (родитель)';
  if (physicalStatus === 'IN_COLLECTED' && disassemblyStatus === 'PARTIAL') return '🔩 Частица (можно продать)';
  if (physicalStatus === 'IN_COLLECTED' && disassemblyStatus === 'RESTORED') return '🔨 Собран (родитель)';
  return physicalStatus;
};

export default function StockTable({ units }: StockTableProps) {
  const inStoreCount = units.filter(u => 
    u.physicalStatus === 'IN_STORE' && (u.status === 'RECEIVED' || u.status === 'IN_STORE')
  ).length;
  
  const inRequestCount = units.filter(u => u.status === 'IN_REQUEST').length;
  const soldCount = units.filter(u => u.physicalStatus === 'SOLD').length;
  const disassembledCount = units.filter(u => u.physicalStatus === 'IN_COLLECTED' && u.disassemblyStatus === 'PARTIAL').length;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold">📋 Товары на складе</h2>
        <div className="flex flex-wrap gap-4 mt-1 text-sm">
          <span className="text-gray-500">Всего: {units.length}</span>
          <span className="text-green-600">В наличии: {inStoreCount}</span>
          <span className="text-yellow-600">Заказано: {inRequestCount}</span>
          <span className="text-blue-600">Продано: {soldCount}</span>
          <span className="text-orange-600">Частицы: {disassembledCount}</span>
        </div>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-sm">Артикул</th>
              <th className="px-4 py-2 text-left text-sm">Серийный номер</th>
              <th className="px-4 py-2 text-left text-sm">Товар</th>
              <th className="px-4 py-2 text-left text-sm">Статус</th>
              <th className="px-4 py-2 text-left text-sm">Цена закупки</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id} className="border-t text-sm">
                <td className="px-4 py-2 font-mono text-xs">
                  {unit.product.code}
                </td>
                <td className="px-4 py-2 font-mono text-xs break-all">
                  {unit.uniqueSerialNumber}
                </td>
                <td className="px-4 py-2">
                  {unit.product.name}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(unit.physicalStatus, unit.disassemblyStatus, unit.status)}`}>
                    {getStatusLabel(unit.physicalStatus, unit.disassemblyStatus, unit.status)}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {unit.purchasePrice ? `${unit.purchasePrice} ₽` : '—'}
                </td>
              </tr>
            ))}
            {units.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Нет товаров. Создайте заказ и примите товар!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}