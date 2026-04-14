// src/app/api/inventory/sell/route.ts
// API endpoint для продажи товара

import { NextRequest, NextResponse } from 'next/server';
import { ProductUnitRepository } from '@/modules/inventory/infrastructure/prisma/product-unit.repository';
import { SellProductUseCase } from '@/modules/inventory/application/use-cases/sell-product.usecase';

export async function POST(request: NextRequest) {
  try {
    // 1. Получаем данные из тела запроса
    const body = await request.json();
    const { serialNumber, price, cashDayId, createdBy, paymentMethod } = body;

    // 2. Валидация обязательных полей
    if (!serialNumber || !price || !cashDayId || !createdBy || !paymentMethod) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля' },
        { status: 400 }
      );
    }

    // 3. Валидация цены
    if (price <= 0) {
      return NextResponse.json(
        { error: 'Цена должна быть больше 0' },
        { status: 400 }
      );
    }

    // 4. Валидация способа оплаты
    const validPaymentMethods = ['CASH', 'CARD', 'TRANSFER'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Неверный способ оплаты' },
        { status: 400 }
      );
    }

    // 5. Выполняем use case
    const repository = new ProductUnitRepository();
    const sellProductUseCase = new SellProductUseCase(repository);
    
    await sellProductUseCase.execute({
      serialNumber,
      price,
      cashDayId,
      createdBy,
      paymentMethod
    });

    // 6. Возвращаем успешный ответ
    return NextResponse.json(
      { 
        success: true, 
        message: `Товар ${serialNumber} успешно продан`,
        data: { serialNumber, price, paymentMethod }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Ошибка при продаже товара:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Внутренняя ошибка сервера' 
      },
      { status: 500 }
    );
  }
}
