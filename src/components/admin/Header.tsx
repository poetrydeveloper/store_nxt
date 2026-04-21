// src/components/admin/Header.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const menuItems = [
  { title: 'Главная', href: '/admin' },
  { title: 'Товары', href: '/admin/products' },
  { title: 'Категории', href: '/admin/categories' },
  { title: 'Бренды', href: '/admin/brands' },
  { title: 'Склад', href: '/admin/inventory' },
  { title: 'Заказы', href: '/admin/orders' },
  { title: 'Поставщики', href: '/admin/suppliers' },
  { title: 'Покупатели', href: '/admin/customers' },
  { title: 'Касса', href: '/admin/cash' },
  { title: 'Кассовые дни', href: '/admin/cash-days' },
];

export default function Header() {
  const pathname = usePathname();
  const [openCashDay, setOpenCashDay] = useState<{ id: number } | null>(null);

  const fetchOpenCashDay = async () => {
    const res = await fetch('/api/cash-days');
    const data = await res.json();
    if (data.success) {
      const open = data.data.find((d: any) => !d.isClosed);
      setOpenCashDay(open || null);
    }
  };

  useEffect(() => {
    fetchOpenCashDay();
    // Обновляем каждые 10 секунд
    const interval = setInterval(fetchOpenCashDay, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">CRM</span>
          <span className="text-xs text-gray-400 hidden sm:inline">Учёт товаров</span>
        </div>

        <nav className="flex flex-wrap items-center gap-0.5">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 rounded-md text-sm transition-colors whitespace-nowrap ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-xs">
          <div className="text-gray-400 hidden lg:block">
            📅 {new Date().toLocaleDateString('ru-RU')}
          </div>
          {openCashDay ? (
            <div className="bg-green-800 text-green-100 px-2 py-0.5 rounded-full">
              Смена №{openCashDay.id}
            </div>
          ) : (
            <div className="bg-yellow-800 text-yellow-100 px-2 py-0.5 rounded-full">
              Нет смены
            </div>
          )}
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
}