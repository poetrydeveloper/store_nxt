// src/app/admin/cash/components/SimpleForm.tsx

'use client';

interface SimpleFormProps {
  type: 'expense' | 'income';
  amount: string;
  setAmount: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  onSubmit: () => void;
}

export default function SimpleForm({
  type,
  amount,
  setAmount,
  description,
  setDescription,
  onSubmit,
}: SimpleFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          placeholder="Сумма"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          step="0.01"
          required
        />
        <input
          type="text"
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">
          {type === 'expense' ? 'Добавить расход' : 'Добавить доход'}
        </button>
      </form>
    </div>
  );
}