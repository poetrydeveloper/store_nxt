'use client';

import { useState, useEffect } from 'react';
import SellForm from './components/SellForm';
import ReturnForm from './components/ReturnForm';
import CreateUnitForm from './components/CreateUnitForm';
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
  product: { name: string };
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

  const handleSell = async (serialNumber: string, price: number, paymentMethod: string) => {
    const res = await fetch('/api/inventory/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serialNumber, price, cashDayId: 1, createdBy: 'admin', paymentMethod }),
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

  const handleCreateUnit = async (data: any) => {
    const res = await fetch('/api/product-units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await fetchUnits();
  };

  const handleManualReceipt = async (data: any) => {
    const res = await fetch('/api/manual-receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, pricePending: !data.purchasePrice }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await fetchUnits();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Управление складом и продажами</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SellForm onSell={handleSell} />
            <ReturnForm onReturn={handleReturn} />
            <CreateUnitForm products={products} suppliers={suppliers} onCreateUnit={handleCreateUnit} />
            <ManualReceiptForm products={products} onManualReceipt={handleManualReceipt} />
          </div>
          <StockTable units={units} />
        </div>
      </div>
    </div>
  );
}
