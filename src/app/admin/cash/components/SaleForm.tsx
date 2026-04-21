// src/app/admin/cash/components/SaleForm.tsx

'use client';

interface ProductUnit {
  id: number;
  uniqueSerialNumber: string;
  product: { id: number; code: string; name: string; categoryId: number };
  physicalStatus: string;
  disassemblyStatus: string;
}

interface SaleFormProps {
  selectedUnit: ProductUnit | null;
  salePrice: string;
  setSalePrice: (value: string) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onSell: () => void;
}

export default function SaleForm({
  selectedUnit,
  salePrice,
  setSalePrice,
  paymentMethod,
  setPaymentMethod,
  onSell,
}: SaleFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSell();
  };

  if (!selectedUnit) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-center text-gray-500 text-sm py-4">
          Выберите товар из дерева слева или через поиск
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Цена продажи"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            step="0.01"
            required
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="CASH">Наличные</option>
            <option value="CARD">Карта</option>
            <option value="TRANSFER">Перевод</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">
          Продать
        </button>
      </form>
    </div>
  );
}