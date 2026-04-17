// src/components/admin/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  title: string;
  icon: string;
  href: string;
  subItems?: { title: string; icon: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Главная',
    icon: '🏠',
    href: '/admin',
  },
  {
    title: 'Товары',
    icon: '📦',
    href: '#',
    subItems: [
      { title: 'Каталог (дерево)', icon: '🗂️', href: '/admin/categories' },
      { title: 'Все товары', icon: '✨', href: '/admin/products' },
      { title: 'Бренды', icon: '🏢', href: '/admin/brands' },
    ],
  },
  {
    title: 'Заказы поставщикам',
    icon: '🚚',
    href: '#',
    subItems: [
      { title: 'Список заказов', icon: '📋', href: '/admin/orders' },
      { title: 'Приёмка товара', icon: '✅', href: '/admin/receive' },
    ],
  },
  {
    title: 'Склад',
    icon: '📊',
    href: '/admin/inventory',
  },
  {
    title: 'Продажи',
    icon: '💰',
    href: '#',
    subItems: [
      { title: 'Продать товар', icon: '🛒', href: '/admin/inventory' },
      { title: 'Возврат', icon: '🔄', href: '/admin/inventory' },
    ],
  },
  {
    title: 'Касса',
    icon: '💵',
    href: '#',
    subItems: [
      { title: 'Кассовые дни', icon: '📅', href: '/admin/cash-days' },
      { title: 'Операции', icon: '📊', href: '/admin/cash' },
    ],
  },
  {
    title: 'Аналитика',
    icon: '📈',
    href: '/admin/analytics',
  },
  {
    title: 'Справочники',
    icon: '📚',
    href: '#',
    subItems: [
      { title: 'Поставщики', icon: '🚚', href: '/admin/suppliers' },
      { title: 'Покупатели', icon: '👥', href: '/admin/customers' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '#') return false;
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex-shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">CRM Система</h1>
        <p className="text-xs text-gray-400">Учёт товаров</p>
      </div>
      
      <nav className="p-2">
        {menuItems.map((item, idx) => (
          <div key={idx} className="mb-1">
            {item.subItems ? (
              <>
                <div className="px-3 py-2 text-gray-400 text-sm font-semibold uppercase">
                  {item.icon} {item.title}
                </div>
                <div className="ml-2">
                  {item.subItems.map((sub, subIdx) => (
                    <Link
                      key={subIdx}
                      href={sub.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive(sub.href)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <span>{sub.icon}</span>
                      <span>{sub.title}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}