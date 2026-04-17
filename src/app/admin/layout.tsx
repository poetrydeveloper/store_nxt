// src/app/admin/layout.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [openCashDay, setOpenCashDay] = useState<{ id: number; isClosed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOpenCashDay = async () => {
    try {
      const res = await fetch('/api/cash-days');
      const data = await res.json();
      if (data.success) {
        const open = data.data.find((d: any) => !d.isClosed);
        setOpenCashDay(open || null);
      }
    } catch (error) {
      console.error('Ошибка загрузки смены:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenCashDay();
    
    // Обновляем статус каждые 5 секунд
    const interval = setInterval(fetchOpenCashDay, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/admin', label: '🏠 Главная' },
    { href: '/admin/products', label: '🏷️ Товары' },
    { href: '/admin/categories', label: '📁 Категории' },
    { href: '/admin/brands', label: '🏢 Бренды' },
    { href: '/admin/inventory', label: '📦 Склад' },
    { href: '/admin/orders', label: '📋 Заказы' },
    { href: '/admin/suppliers', label: '🚚 Поставщики' },
    { href: '/admin/customers', label: '👥 Покупатели' },
    { href: '/admin/cash', label: '💵 Касса' },
    { href: '/admin/cash-days', label: '📅 Кассовые дни' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Боковое меню */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">CRM Система</h1>
          <p className="text-xs text-gray-400">Учёт товаров</p>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === item.href ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Основная область */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Шапка */}
        <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-gray-500">📅 {new Date().toLocaleDateString('ru-RU')}</div>
            {loading ? (
              <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                ⏳ Проверка...
              </div>
            ) : openCashDay ? (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                ✅ Смена №{openCashDay.id} открыта
              </div>
            ) : (
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                ⚠️ Нет открытой смены
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
              A
            </div>
            <span className="text-sm font-medium">Администратор</span>
          </div>
        </header>

        {/* Контент */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}