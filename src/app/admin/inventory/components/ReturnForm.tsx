'use client';

import { useState } from 'react';

interface ReturnFormProps {
  onReturn: (serialNumber: string, reason: string) => Promise<void>;
}

export default function ReturnForm({ onReturn }: ReturnFormProps) {
  const [serialNumber, setSerialNumber] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult({});

    try {
      await onReturn(serialNumber, reason);
      setResult({ success: true, message: 'Товар возвращён' });
      setSerialNumber('');
      setReason('');
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">🔄 Возврат товара</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          placeholder="Серийный номер товара *"
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Причина возврата"
          className="w-full border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700"
        >
          {loading ? 'Обработка...' : 'Вернуть товар'}
        </button>
      </form>
      {result.message && (
        <div className={`mt-4 p-3 rounded-lg ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {result.message || result.error}
        </div>
      )}
    </div>
  );
}