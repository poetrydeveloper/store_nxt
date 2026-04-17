'use client';

import { useEffect, useState } from 'react';
import ProductSelector from './components/ProductSelector';

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
  status: string;
  purchasePrice?: number;
  product: Product;
  supplier?: Supplier;
}

interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  productUnits: ProductUnit[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    expectedDeliveryDate: '',
  });
  const [items, setItems] = useState<{ 
    productId: string; 
    productCode: string; 
    productName: string;
    supplierId: string; 
    quantity: string;
    purchasePrice: string;
  }[]>([]);

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
    console.log('➕ addItem вызван');
    const newItem = { 
      productId: '', 
      productCode: '', 
      productName: '',
      supplierId: '', 
      quantity: '1',
      purchasePrice: ''
    };
    console.log('📦 Новый item:', newItem);
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const openProductSelector = (index: number) => {
    console.log('🔓 openProductSelector вызван с index:', index);
    setCurrentEditingIndex(index);
    setShowProductSelector(true);
  };

  const handleProductSelect = (product: Product) => {
    console.log('🎯 handleProductSelect вызван с товаром:', product);
    console.log('currentEditingIndex:', currentEditingIndex);
    
    if (currentEditingIndex !== null) {
      setItems(prevItems => {
        const newItems = [...prevItems];
        newItems[currentEditingIndex] = {
          ...newItems[currentEditingIndex],
          productId: product.id.toString(),
          productCode: product.code,
          productName: product.name,
        };
        console.log('✅ Обновлён элемент:', newItems[currentEditingIndex]);
        return newItems;
      });
    }
    
    setShowProductSelector(false);
    setCurrentEditingIndex(null);
  };

  const validateForm = () => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId) {
        alert(`Товар ${i + 1}: не выбран товар`);
        return false;
      }
      if (!item.quantity || parseInt(item.quantity) <= 0) {
        alert(`Товар ${i + 1}: укажите количество больше 0`);
        return false;
      }
      if (!item.purchasePrice || parseFloat(item.purchasePrice) <= 0) {
        alert(`Товар ${i + 1}: укажите цену закупки больше 0`);
        return false;
      }
    }
    
    if (items.length === 0) {
      alert('Добавьте хотя бы один товар в заказ');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const orderItems = items.map(item => ({
      productId: parseInt(item.productId),
      productCode: item.productCode,
      supplierId: item.supplierId ? parseInt(item.supplierId) : undefined,
      quantity: parseInt(item.quantity),
      purchasePrice: parseFloat(item.purchasePrice),
    }));
    
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expectedDeliveryDate: form.expectedDeliveryDate,
        items: orderItems,
      }),
    });
    
    const data = await res.json();
    
    if (res.ok) {
      setForm({ expectedDeliveryDate: '' });
      setItems([]);
      fetchOrders();
      alert('Заказ успешно создан!');
    } else {
      alert(data.error);
    }
  };

  const handleReceiveUnit = async (unitId: number, serialNumber: string) => {
    const res = await fetch('/api/inventory/receive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId }),
    });
    
    if (res.ok) {
      alert(`Товар ${serialNumber} принят на склад`);
      fetchOrders();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      IN_REQUEST: '⏳ Заказан',
      RECEIVED: '✅ Принят',
      IN_STORE: '📦 На складе',
      SOLD: '💰 Продан',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      IN_REQUEST: 'bg-yellow-100 text-yellow-800',
      RECEIVED: 'bg-green-100 text-green-800',
      IN_STORE: 'bg-blue-100 text-blue-800',
      SOLD: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📋 Заказы поставщикам</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма создания заказа */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">➕ Создать заказ</h2>
          <p className="text-sm text-gray-500 mb-3">
            Номер заказа и дата создания проставляются автоматически
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ожидаемая дата поставки (опционально)</label>
              <input
                type="datetime-local"
                value={form.expectedDeliveryDate}
                onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div className="border-t pt-3">
              <h3 className="font-semibold mb-2">Товары в заказе</h3>
              {items.map((item, index) => (
                <div key={index} className="border rounded p-3 mb-2 bg-gray-50">
                  {item.productId && item.productId !== '' ? (
                    <div className="mb-2 p-2 bg-blue-50 rounded">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-500">Артикул: {item.productCode}</div>
                      <div className="text-xs text-gray-400">ID: {item.productId}</div>
                      <button
                        type="button"
                        onClick={() => openProductSelector(index)}
                        className="text-xs text-blue-600 mt-1 hover:underline"
                      >
                        Изменить товар
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openProductSelector(index)}
                      className="w-full border-2 border-dashed border-gray-300 rounded p-2 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition"
                    >
                      + Выбрать товар
                    </button>
                  )}
                  
                  <select
                    value={item.supplierId}
                    onChange={(e) => updateItem(index, 'supplierId', e.target.value)}
                    className="w-full border rounded px-2 py-1 my-2"
                  >
                    <option value="">Выберите поставщика</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    placeholder="Цена закупки (руб.) *"
                    value={item.purchasePrice}
                    onChange={(e) => updateItem(index, 'purchasePrice', e.target.value)}
                    className="w-full border rounded px-2 py-1 mb-2"
                    step="0.01"
                    required
                  />
                  
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
                    <button type="button" onClick={() => removeItem(index)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-blue-600 text-sm hover:underline">
                + Добавить товар
              </button>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Создать заказ
            </button>
          </form>
        </div>
        
        {/* Список заказов */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-3 bg-gray-50 border-b">
                <h3 className="font-semibold">
                  Заказ №{order.orderNumber}
                  <span className="text-sm text-gray-500 ml-2">
                    от {new Date(order.orderDate).toLocaleString()}
                  </span>
                </h3>
                {order.expectedDeliveryDate && (
                  <p className="text-xs text-gray-500">
                    Ожидаемая поставка: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Серийный номер</th>
                      <th className="px-3 py-2 text-left">Товар</th>
                      <th className="px-3 py-2 text-left">Цена закупки</th>
                      <th className="px-3 py-2 text-left">Статус</th>
                      <th className="px-3 py-2 text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.productUnits.map((unit) => (
                      <tr key={unit.id} className="border-t">
                        <td className="px-3 py-2 font-mono text-xs">{unit.uniqueSerialNumber}</td>
                        <td className="px-3 py-2">{unit.product.name}</td>
                        <td className="px-3 py-2">{unit.purchasePrice ? `${unit.purchasePrice} ₽` : '—'}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(unit.status)}`}>
                            {getStatusLabel(unit.status)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {unit.status === 'IN_REQUEST' && (
                            <button
                              onClick={() => handleReceiveUnit(unit.id, unit.uniqueSerialNumber)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                            >
                              ✅ Принять
                            </button>
                          )}
                          {unit.status === 'RECEIVED' && (
                            <span className="text-green-600 text-xs">✓ На складе</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {order.productUnits.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                          Нет товаров в заказе
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Нет заказов. Создайте первый заказ!
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно выбора товара */}
      {showProductSelector && (
        <ProductSelector
          products={products}
          onSelect={handleProductSelect}
          onClose={() => setShowProductSelector(false)}
        />
      )}
    </div>
  );
}