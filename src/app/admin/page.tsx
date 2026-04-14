// src/app/admin/page.tsx
// Главная страница админ панели

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Админ панель CRM</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Часть 1: Карточки товаров */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">📋 Товары и категории</h2>
            <div className="space-y-2">
              <Link href="/admin/products" className="block text-blue-600 hover:underline">🏷️ Товары</Link>
              <Link href="/admin/categories" className="block text-blue-600 hover:underline">📁 Категории</Link>
              <Link href="/admin/brands" className="block text-blue-600 hover:underline">🏢 Бренды</Link>
            </div>
          </div>

          {/* Часть 2: Движение товаров */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">📦 Движение товаров</h2>
            <div className="space-y-2">
              <Link href="/admin/inventory" className="block text-blue-600 hover:underline">📊 Склад</Link>
              <Link href="/admin/suppliers" className="block text-blue-600 hover:underline">🚚 Поставщики</Link>
              <Link href="/admin/customers" className="block text-blue-600 hover:underline">👥 Покупатели</Link>
            </div>
          </div>

          {/* Часть 3: Касса и финансы */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">💰 Касса и финансы</h2>
            <div className="space-y-2">
              <Link href="/admin/cash" className="block text-blue-600 hover:underline">💵 Кассовые операции</Link>
              <Link href="/admin/cash-days" className="block text-blue-600 hover:underline">📅 Кассовые дни</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">🔧 Быстрые команды:</h3>
          <code className="text-sm block bg-gray-900 text-green-400 p-3 rounded">
            npx prisma studio &nbsp;&nbsp;# Открыть визуальный редактор БД<br/>
            npm test &nbsp;&nbsp;# Запустить тесты<br/>
            npm run test:coverage &nbsp;&nbsp;# Проверить покрытие кода
          </code>
        </div>
      </div>
    </div>
  );
}
