// src/app/api/inventory/return/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// POST /api/inventory/return
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serialNumber, cashDayId, createdBy, reason } = body;

    // 1. Найти товар
    const productUnit = await prisma.productUnit.findUnique({
      where: { uniqueSerialNumber: serialNumber },
    });

    if (!productUnit) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // 2. Проверить, что товар продан
    if (productUnit.physicalStatus !== 'SOLD') {
      return NextResponse.json({ error: 'Можно вернуть только проданный товар' }, { status: 400 });
    }

    // 3. Обновить статус товара
    const updated = await prisma.productUnit.update({
      where: { id: productUnit.id },
      data: {
        physicalStatus: 'IN_STORE',
        isReturned: true,
        returnedAt: new Date(),
        isReserved: false,
      },
    });

    // 4. Создать кассовое событие (возврат)
    await prisma.cashEvent.create({
      data: {
        type: 'RETURN',
        totalAmount: productUnit.salePrice || 0,
        description: `Возврат товара ${serialNumber}${reason ? ` (${reason})` : ''}`,
        paymentMethod: 'CASH',
        createdBy,
        cashDayId,
        items: {
          create: {
            quantity: 1,
            pricePerUnit: productUnit.salePrice || 0,
            subtotal: -(productUnit.salePrice || 0),
            productUnitId: productUnit.id,
          },
        },
      },
    });

    // 5. Создать лог
    await prisma.productUnitLog.create({
      data: {
        type: 'RETURN',
        message: `Товар возвращён${reason ? `: ${reason}` : ''}`,
        meta: { cashDayId, reason },
        productUnitId: productUnit.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Товар ${serialNumber} возвращён`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Ошибка при возврате товара:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}