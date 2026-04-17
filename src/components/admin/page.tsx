// src/app/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface Stats {
  todaySales: number;
  totalProducts: number;
  pendingOrders: number;
  lowStock: number;
}

interface RecentSale {
  id: number;
  productName: string;
  price: number;
  date: string;
}

interface PendingOrder {
  id: number;
  orderNumber: string;
  productName: string;
  quantity: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    todaySales: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStock: 0,
  });
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Получаем товары на складе
      const productsRes = await fetch('/api/product-units');
      const productsData = await productsRes.json();
      const inStore = productsData.data?.filter((p: any) => 
        p.physicalStatus === 'IN_STORE' && p.status !== 'IN_REQUEST'
      ).length || 0;

      // Получаем заказы в статусе IN_REQUEST
      const ordersRes = await fetch('/api/orders');
      const ordersData = await ordersRes.json();
      const pending = ordersData.data?.filter((o: any) => 
        o.productUnits?.some((u: any) => u.status === 'IN_REQUEST')
      ).length || 0;

      setStats({
        todaySales: 125000,
        totalProducts: inStore,
        pendingOrders: pending,
        lowStock: 0,
      });

      // Пример последних продаж (нужно будет заменить на реальные данные)
      setRecentSales([
        { id: 1, productName: 'iPhone 15', price: 70000, date: new Date().toLocaleTimeString() },
        { id: 2, productName: 'Galaxy S24', price: 60000, date: new Date().toLocaleTimeString() },
      ]);

      setPendingOrders([
        { id: 1, orderNumber: 'ORD-001', productName: 'iPhone 15', quantity: 2 },
        { id: 2, orderNumber: 'ORD-002', productName: 'Galaxy S24', quantity: 1 },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Загрузка...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Дашборд</h1>
      
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-2xl font-bold">{stats.todaySales.toLocaleString()} ₽</div>
          <div className="text-gray-500 text-sm">Продажи за сегодня</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl mb-2">📦</div>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <div className="text-gray-500 text-sm">Товаров на складе</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl mb-2">🚚</div>
          <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          <div className="text-gray-500 text-sm">Ожидают приёмки</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-2xl font-bold">{stats.lowStock}</div>
          <div className="text-gray-500 text-sm">Товаров заканчиваются</div>
        </div>
      </div>
      
      {/* Последние продажи и ожидающие заказы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">📈 Последние продажи</h2>
          </div>
          <div className="divide-y">
            {recentSales.map((sale) => (
              <div key={sale.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{sale.productName}</div>
                  <div className="text-sm text-gray-500">{sale.date}</div>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {sale.price.toLocaleString()} ₽
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">🚚 Ожидают приёмки</h2>
          </div>
          <div className="divide-y">
            {pendingOrders.map((order) => (
              <div key={order.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">Заказ {order.orderNumber}</div>
                  <div className="text-sm text-gray-500">
                    {order.productName} x{order.quantity}
                  </div>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                  ✅ Принять
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}