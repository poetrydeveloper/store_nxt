// src/app/api/cash-events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/cash-events?cashDayId=1 - получить события по смене
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cashDayId = searchParams.get('cashDayId');

    if (!cashDayId) {
      return NextResponse.json({ error: 'cashDayId required' }, { status: 400 });
    }

    const events = await prisma.cashEvent.findMany({
      where: { cashDayId: parseInt(cashDayId) },
      include: { items: { include: { productUnit: { include: { product: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/cash-events - создать кассовую операцию
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, totalAmount, description, paymentMethod, createdBy, cashDayId, items } = body;

    // Проверяем, что смена открыта
    const cashDay = await prisma.cashDay.findUnique({
      where: { id: cashDayId },
    });

    if (!cashDay || cashDay.isClosed) {
      return NextResponse.json({ error: 'Смена закрыта или не существует' }, { status: 400 });
    }

    // Создаём событие
    const event = await prisma.cashEvent.create({
      data: {
        type,
        totalAmount,
        description,
        paymentMethod,
        createdBy,
        cashDayId,
      },
    });

    // Создаём позиции
    if (items && items.length > 0) {
      for (const item of items) {
        await prisma.cashEventItem.create({
          data: {
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            subtotal: item.subtotal,
            cashEventId: event.id,
            productUnitId: item.productUnitId,
          },
        });
      }
    }

    // Обновляем итог смены
    const allEvents = await prisma.cashEvent.findMany({
      where: { cashDayId },
    });
    const total = allEvents.reduce((sum, e) => sum + e.totalAmount, 0);

    await prisma.cashDay.update({
      where: { id: cashDayId },
      data: { total },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/cash-events?id=1 - удалить операцию
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const event = await prisma.cashEvent.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) {
      return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 });
    }

    // Проверяем, что смена открыта
    const cashDay = await prisma.cashDay.findUnique({
      where: { id: event.cashDayId },
    });

    if (!cashDay || cashDay.isClosed) {
      return NextResponse.json({ error: 'Нельзя удалить событие из закрытой смены' }, { status: 400 });
    }

    await prisma.cashEvent.delete({
      where: { id: parseInt(id) },
    });

    // Обновляем итог смены
    const allEvents = await prisma.cashEvent.findMany({
      where: { cashDayId: event.cashDayId },
    });
    const total = allEvents.reduce((sum, e) => sum + e.totalAmount, 0);

    await prisma.cashDay.update({
      where: { id: event.cashDayId },
      data: { total },
    });

    return NextResponse.json({ success: true, message: 'Событие удалено' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}