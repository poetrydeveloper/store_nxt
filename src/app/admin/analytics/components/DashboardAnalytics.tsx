// src/app/admin/analytics/components/DashboardAnalytics.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#8dd1e1'];

export default function DashboardAnalytics() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/dashboard?days=${period}`);
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  if (loading) return <div className="p-8 text-center">Загрузка данных...</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📈 Аналитика продаж</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(parseInt(e.target.value))}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value={7}>7 дней</option>
          <option value={30}>30 дней</option>
          <option value={90}>90 дней</option>
        </select>
      </div>

      {/* Карточки с итогами */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl mb-2">📦</div>
          <div className="text-2xl font-bold">{data?.totalUnits || 0}</div>
          <div className="text-gray-500 text-sm">всего юнитов на складе</div>
          <div className="text-sm text-green-600 mt-1">{data?.totalValueInStore?.toLocaleString()} ₽</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-2xl font-bold text-green-600">{data?.totalSoldValue?.toLocaleString()} ₽</div>
          <div className="text-gray-500 text-sm">продано за период</div>
          <div className="text-sm text-blue-600 mt-1">{data?.totalSoldCount} шт.</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl mb-2">🚚</div>
          <div className="text-2xl font-bold text-yellow-600">{data?.totalOrderedValue?.toLocaleString()} ₽</div>
          <div className="text-gray-500 text-sm">заказано (в пути)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-2xl font-bold text-red-600">{data?.lowStock?.length || 0}</div>
          <div className="text-gray-500 text-sm">товаров с остатком &lt; 3</div>
        </div>
      </div>

      {/* График продаж по дням */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">📈 Динамика продаж</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.dailyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} fontSize={10} />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="sold" name="Кол-во продаж" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="revenue" name="Выручка (₽)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ товаров */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">🏆 Топ товаров по выручке</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data?.topProducts?.slice(0, 10).map((product: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  sessionStorage.setItem('quickSellProduct', JSON.stringify({
                    code: product.code,
                    name: product.name,
                  }));
                  router.push('/admin/cash');
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                  <div>
                    <div className="text-sm font-medium truncate max-w-[200px]">{product.name}</div>
                    <div className="text-xs text-gray-400">{product.code}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{product.sold} шт.</div>
                  <div className="text-xs text-green-600">{product.revenue.toLocaleString()} ₽</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Распределение по категориям */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">📁 Продажи по категориям</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.categoryDistribution?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Прогноз спроса */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">🔮 Прогноз и рекомендации</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-800">📈 Рекомендуется пополнить</div>
            <div className="text-sm text-gray-600 mt-1">
              Товары с остатком меньше средней недельной продажи
            </div>
            <div className="mt-2 space-y-1">
              {data?.lowStock?.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="text-sm flex justify-between">
                  <span>{item.name}</span>
                  <span className="font-mono">{item.stock} шт.</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-800">🔥 Лидеры продаж</div>
            <div className="text-sm text-gray-600 mt-1">
              Товары с наибольшей выручкой за период
            </div>
            <div className="mt-2 space-y-1">
              {data?.topProducts?.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="text-sm flex justify-between">
                  <span>{item.name}</span>
                  <span className="font-mono">{item.sold} шт.</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}