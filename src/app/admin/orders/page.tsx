// src/app/admin/orders/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    orderNumber: '',
    expectedDeliveryDate: '',
  });
  const [items, setItems] = useState<{ productId: string; productCode: string; supplierId: string; quantity: string }[]>([]);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    if (data.success) setOrders(data.data);
    setLoading(false);
  };

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

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const addItem = () => {
    setItems([...items, { productId: '', productCode: '', supplierId: '', quantity: '1' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderItems = items.map(item => ({
      productId: parseInt(item.productId),
      productCode: item.productCode,
      supplierId: item.supplierId ? parseInt(item.supplierId) : undefined,
      quantity: parseInt(item.quantity),
    }));
    
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: form.orderNumber,
        expectedDeliveryDate: form.expectedDeliveryDate,
        items: orderItems,
      }),
    });
    
    if (res.ok) {
      setForm({ orderNumber: '', expectedDeliveryDate: '' });
      setItems([]);
      fetchOrders();
    }
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Заказы поставщикам</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма создания заказа */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Создать заказ</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Номер заказа *"
              value={form.orderNumber}
              onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
            
            <input
              type="datetime-local"
              placeholder="Ожидаемая дата поставки"
              value={form.expectedDeliveryDate}
              onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            
            <div className="border-t pt-3">
              <h3 className="font-semibold mb-2">Товары в заказе</h3>
              {items.map((item, index) => (
                <div key={index} className="border rounded p-3 mb-2">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    className="w-full border rounded px-2 py-1 mb-2"
                    required
                  >
                    <option value="">Выберите товар</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Артикул (код)"
                    value={item.productCode}
                    onChange={(e) => updateItem(index, 'productCode', e.target.value)}
                    className="w-full border rounded px-2 py-1 mb-2"
                    required
                  />
                  <select
                    value={item.supplierId}
                    onChange={(e) => updateItem(index, 'supplierId', e.target.value)}
                    className="w-full border rounded px-2 py-1 mb-2"
                  >
                    <option value="">Выберите поставщика</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Количество"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="flex-1 border rounded px-2 py-1"
                      min="1"
                      required
                    />
                    <button type="button" onClick={() => removeItem(index)} className="bg-red-500 text-white px-2 py-1 rounded">
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-blue-600 text-sm">
                + Добавить товар
              </button>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Создать заказ
            </button>
          </form>
        </div>
        
        {/* Список заказов */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Номер заказа</th>
                <th className="px-4 py-2 text-left">Дата</th>
                <th className="px-4 py-2 text-left">Ожидаемая дата</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-2">{order.id}</td>
                  <td className="px-4 py-2">{order.orderNumber}</td>
                  <td className="px-4 py-2">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}