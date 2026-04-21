// src/app/admin/cash/components/OperationTabs.tsx

'use client';

interface OperationTabsProps {
  operationType: 'sale' | 'disassembly' | 'expense' | 'income';
  setOperationType: (type: 'sale' | 'disassembly' | 'expense' | 'income') => void;
}

export default function OperationTabs({ operationType, setOperationType }: OperationTabsProps) {
  const tabs = [
    { id: 'sale', label: '💰 Продажа' },
    { id: 'disassembly', label: '🔧 Разбор/Сбор' },
    { id: 'expense', label: '📉 Расход' },
    { id: 'income', label: '📈 Доход' },
  ] as const;

  return (
    <div className="flex border-b mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setOperationType(tab.id)}
          className={`flex-1 py-2 text-center transition-colors ${
            operationType === tab.id
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}