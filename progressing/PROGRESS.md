CRM Система учёта товаров - Прогресс разработки
Дата: 14 апреля 2026

📋 ОГЛАВЛЕНИЕ
Что сделано за сегодня

Структура проекта

База данных (PostgreSQL)

Ключевые настройки

Что осталось сделать

Быстрые команды

✅ ЧТО СДЕЛАНО ЗА СЕГОДНЯ
Часть 1: Карточки товаров (ГОТОВО)
Компонент	Что сделано	Статус
Category	Entity, Repository, API (GET/POST/PUT/DELETE), UI с деревом (вложенность), Тесты	✅
Brand	Entity, API (GET/POST), UI (создание + список), Тесты	✅
Product	Entity, API (GET/POST), UI (создание + список + выбор категории/бренда), Тесты (в процессе)	🟡 80%
ProductImage	API (GET/POST/DELETE), UI в админке (добавление/удаление), Placeholder (SVG), Тесты (нет)	🟡 70%
Часть 2: Движение товаров (НАЧАТО)
Компонент	Что сделано	Статус
ProductUnit	Entity (полная бизнес-логика), Repository, Sell Use Case, API (/inventory/sell), Тесты (4 passed)	🟡 60%
Supplier	Entity, API (GET/POST), UI (создание + список), Тесты	✅
Customer	❌ не начат	🔴
Order	❌ не начат	🔴
ManualReceipt	❌ не начат	🔴
DisassemblyScenario	❌ не начат	🔴
Часть 3: Касса и финансы (НЕ НАЧАТО)
Компонент	Статус
CashDay	🔴
CashEvent	🔴
Payment	🔴
Prepayment	🔴
DebtTracking	🔴
Тесты
Файл	Статус
product-unit.entity.spec.ts	✅ 4 теста
category.entity.spec.ts	✅ 7 тестов
brand.entity.spec.ts	✅ 2 теста
supplier.entity.spec.ts	✅ 2 теста
📁 СТРУКТУРА ПРОЕКТА
text
store_nxt/
├── .env                                 # DATABASE_URL
├── .gitignore
├── package.json
├── tsconfig.json                        # алиас @/* → src/*
├── jest.config.ts                       # конфиг тестов
├── next.config.ts
├── prisma/
│   ├── schema.prisma                    # ПОЛНАЯ схема БД
│   └── migrations/                      # миграции
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── page.tsx                 # главная админки (ссылки)
│   │   │   ├── products/
│   │   │   │   └── page.tsx             # CRUD товаров + изображения
│   │   │   ├── categories/
│   │   │   │   └── page.tsx             # CRUD категорий (дерево)
│   │   │   ├── brands/
│   │   │   │   └── page.tsx             # CRUD брендов
│   │   │   ├── suppliers/
│   │   │   │   └── page.tsx             # CRUD поставщиков
│   │   │   └── inventory/
│   │   │       └── page.tsx             # продажа товаров
│   │   ├── api/
│   │   │   ├── categories/
│   │   │   │   ├── route.ts             # GET/POST список
│   │   │   │   └── [id]/route.ts        # GET/PUT/DELETE одна
│   │   │   ├── brands/
│   │   │   │   └── route.ts             # GET/POST
│   │   │   ├── products/
│   │   │   │   └── route.ts             # GET/POST
│   │   │   ├── product-images/
│   │   │   │   └── route.ts             # GET/POST/DELETE (через query)
│   │   │   ├── suppliers/
│   │   │   │   └── route.ts             # GET/POST
│   │   │   ├── inventory/
│   │   │   │   └── sell/
│   │   │   │       └── route.ts         # POST продажа
│   │   │   └── placeholder/
│   │   │       └── route.ts             # SVG placeholder
│   │   └── layout.tsx
│   ├── modules/
│   │   ├── shared/
│   │   │   └── database/
│   │   │       └── prisma.service.ts    # единый PrismaClient
│   │   ├── products/
│   │   │   ├── domain/
│   │   │   │   └── entities/
│   │   │   │       ├── category.entity.ts
│   │   │   │       ├── brand.entity.ts
│   │   │   │       └── product.entity.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── prisma/
│   │   │   │       ├── category.repository.ts
│   │   │   │       └── product.repository.ts
│   │   │   └── tests/
│   │   │       ├── category.entity.spec.ts
│   │   │       └── brand.entity.spec.ts
│   │   ├── inventory/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── product-unit.entity.ts
│   │   │   │   │   └── supplier.entity.ts
│   │   │   │   ├── enums/
│   │   │   │   │   ├── status.enum.ts
│   │   │   │   │   └── physical-status.enum.ts
│   │   │   │   └── repositories/
│   │   │   ├── infrastructure/
│   │   │   │   └── prisma/
│   │   │   │       └── product-unit.repository.ts
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   │       └── sell-product.usecase.ts
│   │   │   └── tests/
│   │   │       └── product-unit.entity.spec.ts
│   │   ├── cash/                         # пусто
│   │   └── logging/                      # пусто
│   └── components/
│       └── ProductImage.tsx              # компонент с fallback
└── node_modules/
🗄️ БАЗА ДАННЫХ (PostgreSQL)
Подключение: postgresql://postgres:12345@localhost:5432/nxt_db?schema=public

Таблицы (созданы через Prisma):
Таблица	Описание
Category	Категории (с поддержкой parentId для вложенности)
Brand	Бренды производителей
Product	Карточки товаров
ProductImage	Изображения товаров (связь с Product)
Supplier	Поставщики
Customer	Покупатели (баланс, долги)
ProductUnit	Физические экземпляры товаров (серийные номера)
Order	Заказы поставщикам
CashDay	Кассовые дни (смены)
CashEvent	Кассовые операции
CashEventItem	Позиции в чеке
Payment	Платежи покупателей
Prepayment	Предоплаты
DebtTracking	Отслеживание долгов
ProductUnitLog	Логи изменений ProductUnit
DisassemblyScenario	Сценарии разборки/сборки
ManualReceipt	Ручной приём товара
ShortageResolution	Расхождения по заказам
⚙️ КЛЮЧЕВЫЕ НАСТРОЙКИ
1. Алиас @ (работает)
json
// tsconfig.json
"baseUrl": ".",
"paths": { "@/*": ["src/*"] }
2. Prisma (версия 6)
prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
3. Prisma Client (единый экземпляр)
typescript
// src/modules/shared/database/prisma.service.ts
export const prisma = new PrismaClient();
4. Переменные окружения (.env)
text
DATABASE_URL="postgresql://postgres:12345@localhost:5432/nxt_db?schema=public"
📝 ЧТО ОСТАЛОСЬ СДЕЛАТЬ
🔴 HIGH PRIORITY (Часть 1 - доделать)
Задача	Описание
Product тесты	Написать product.entity.spec.ts
Product PUT/DELETE API	Добавить редактирование и удаление товаров
Product UI - редактирование	Кнопки ✏️ и 🗑️ в таблице товаров
Загрузка реальных файлов	Вместо placeholder (multer или Next.js API)
🟡 MEDIUM PRIORITY (Часть 2 - продолжить)
Задача	Описание
Customer	Entity, API (GET/POST), UI, тесты
ProductUnit UI	Создание экземпляров товара через админку
ProductUnit список	Просмотр товаров на складе (IN_STORE, SOLD и т.д.)
Order	Заказы поставщикам + метод createProductUnits()
Возврат товара	API /inventory/return + Use Case
Списание товара	API /inventory/lose + Use Case
🟢 LOW PRIORITY (Часть 2 - сложное)
Задача	Описание
DisassemblyScenario	Сценарии разборки/сборки коллекций
ManualReceipt	Ручной приём товара (цена неизвестна)
ShortageResolution	Обработка расхождений по заказам
⚫ NOT STARTED (Часть 3 - касса)
Задача
CashDay - открытие/закрытие смены
CashEvent - создание операций
Payment - платежи покупателей
Prepayment - предоплаты
DebtTracking - отслеживание долгов
📚 Документация
Задача
API документация (swagger)
Инструкция по развертыванию
🚀 БЫСТРЫЕ КОМАНДЫ
bash
# Запуск
npm run dev                    # http://localhost:3000

# Тесты
npm test                       # запустить все тесты
npm run test:watch            # режим наблюдения
npm run test:coverage         # покрытие кода

# База данных
npx prisma studio              # http://localhost:5555
npx prisma migrate dev --name <name>   # новая миграция
npx prisma generate            # перегенерация клиента

# Git
git add .
git commit -m "message"
git push origin main

# API проверка
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/products
curl http://localhost:3000/api/brands
curl http://localhost:3000/api/suppliers

# Продажа
curl -X POST http://localhost:3000/api/inventory/sell \
  -H "Content-Type: application/json" \
  -d '{"serialNumber":"TEST-001","price":1000,"cashDayId":1,"createdBy":"admin","paymentMethod":"CASH"}'

# Изображения
curl -X POST "http://localhost:3000/api/product-images?productId=1" \
  -H "Content-Type: application/json" \
  -d '{"sortOrder":0}'
🔗 ССЫЛКИ (локально)
Страница	URL
Главная админки	http://localhost:3000/admin
Товары	http://localhost:3000/admin/products
Категории	http://localhost:3000/admin/categories
Бренды	http://localhost:3000/admin/brands
Поставщики	http://localhost:3000/admin/suppliers
Продажа	http://localhost:3000/admin/inventory
Prisma Studio	http://localhost:5555
📌 ЗАМЕТКИ
Prisma версия 6 - не переходить на 7, пока не будет стабильной

Алиас @ работает - используем @/modules/...

Placeholder изображений - генерируется через /api/placeholder

База данных - PostgreSQL, имя nxt_db

Все тесты проходят - 13+ тестов, все зеленые

Документ обновлён 14.04.2026

Сохраните этот файл как PROGRESS.md. Завтра в новом диалоге скиньте его мне, и мы продолжим с того места, где остановились.