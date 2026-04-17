// src/app/admin/inventory/page.tsx

'use client';

import { useState, useEffect } from 'react';
import SellForm from './components/SellForm';
import ReturnForm from './components/ReturnForm';
import ManualReceiptForm from './components/ManualReceiptForm';
import StockTable from './components/StockTable';

interface Product {
  id: number;
  code: string;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface ProductUnit {
  id: number;
  uniqueSerialNumber: string;
  purchasePrice?: number;
  physicalStatus: string;
  status: string;
  product: { id: number; code: string; name: string };
}

export default function InventoryAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [units, setUnits] = useState<ProductUnit[]>([]);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) setProducts(data.data);
  };

  const fetchSuppliers = async () => {
    const res = await fetch('/api/suppliers');
    const data = await res.json();
    if (data.success) setSuppliers(data.data);
  };

  const fetchUnits = async () => {
    const res = await fetch('/api/product-units');
    const data = await res.json();
    if (data.success) setUnits(data.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchUnits();
  }, []);

  const handleSell = async (serialNumber: string, price: number, paymentMethod: string, cashDayId: number) => {
    const res = await fetch('/api/inventory/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serialNumber, price, cashDayId, createdBy: 'admin', paymentMethod }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await fetchUnits();
  };

  const handleReturn = async (serialNumber: string, reason: string) => {
    const res = await fetch('/api/inventory/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serialNumber, cashDayId: 1, createdBy: 'admin', reason }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await fetchUnits();
  };

  const handleManualReceipt = async (data: { productId: number; purchasePrice: number }) => {
  // Генерируем серийный номер
  const product = products.find(p => p.id === data.productId);
  if (!product) throw new Error('Товар не найден');
  
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const uniqueSerialNumber = `${product.code}-MANUAL-${timestamp}-${random}`;
  
  const res = await fetch('/api/manual-receipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: data.productId,
      uniqueSerialNumber,
      purchasePrice: data.purchasePrice,
      acceptedBy: 'admin',
      comment: 'Ручной приём',
      pricePending: false,
    }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  await fetchUnits();
};

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Управление складом и продажами</h1>
        
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">📖 Как пополнить склад:</h3>
          <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
            <li>Перейдите в раздел <strong>Заказы</strong> и создайте заказ поставщику</li>
            <li>В заказе укажите товары, цены закупки и количество</li>
            <li>После поступления товара нажмите кнопку <strong>✅ Принять</strong> в заказе</li>
            <li>Товар автоматически появится на складе со статусом "В магазине"</li>
            <li>Перед продажей откройте кассовую смену в разделе <strong>Кассовые дни</strong> или прямо в форме продажи</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SellForm onSell={handleSell} />
            <ReturnForm onReturn={handleReturn} />
            <ManualReceiptForm products={products} onManualReceipt={handleManualReceipt} />
          </div>
          <StockTable units={units} />
        </div>
      </div>
    </div>
  );
}