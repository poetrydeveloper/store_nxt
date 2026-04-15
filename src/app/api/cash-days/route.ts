// src/app/api/cash-days/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/cash-days - список всех смен
export async function GET() {
  try {
    const cashDays = await prisma.cashDay.findMany({
      include: { events: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, data: cashDays });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/cash-days - открыть новую смену
export async function POST() {
  try {
    // Проверяем, есть ли открытая смена
    const openDay = await prisma.cashDay.findFirst({
      where: { isClosed: false },
    });

    if (openDay) {
      return NextResponse.json({ error: 'Уже есть открытая смена' }, { status: 400 });
    }

    const cashDay = await prisma.cashDay.create({
      data: {
        date: new Date(),
        isClosed: false,
        total: 0,
      },
    });

    return NextResponse.json({ success: true, data: cashDay }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/cash-days?action=close - закрыть смену
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action !== 'close') {
      return NextResponse.json({ error: 'Неверный параметр' }, { status: 400 });
    }

    const openDay = await prisma.cashDay.findFirst({
      where: { isClosed: false },
    });

    if (!openDay) {
      return NextResponse.json({ error: 'Нет открытой смены' }, { status: 404 });
    }

    // Пересчитываем итог
    const events = await prisma.cashEvent.findMany({
      where: { cashDayId: openDay.id },
    });

    const total = events.reduce((sum, event) => sum + event.totalAmount, 0);

    const closedDay = await prisma.cashDay.update({
      where: { id: openDay.id },
      data: { isClosed: true, total },
    });

    return NextResponse.json({ success: true, data: closedDay, message: `Смена закрыта. Итог: ${total} руб.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}