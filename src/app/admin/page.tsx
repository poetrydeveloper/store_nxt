// src/app/admin/page.tsx
// Главная страница админ панели

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Админ панель CRM</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/inventory" 
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-2xl mb-2">📦</div>
            <h2 className="text-xl font-semibold mb-2">Движение товаров</h2>
            <p className="text-gray-600">Продажа, возврат, списание товаров</p>
          </Link>

          <Link href="/admin/products" 
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-2xl mb-2">🏷️</div>
            <h2 className="text-xl font-semibold mb-2">Товары</h2>
            <p className="text-gray-600">Управление карточками товаров</p>
          </Link>

          <Link href="/admin/categories" 
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-2xl mb-2">📁</div>
            <h2 className="text-xl font-semibold mb-2">Категории</h2>
            <p className="text-gray-600">Управление категориями товаров</p>
          </Link>

          <Link href="/admin/brands" 
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-2xl mb-2">🏢</div>
            <h2 className="text-xl font-semibold mb-2">Бренды</h2>
            <p className="text-gray-600">Управление брендами производителей</p>
          </Link>

          <Link href="/admin/cash" 
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-2xl mb-2">💰</div>
            <h2 className="text-xl font-semibold mb-2">Касса</h2>
            <p className="text-gray-600">Кассовые операции и финансы</p>
          </Link>
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
