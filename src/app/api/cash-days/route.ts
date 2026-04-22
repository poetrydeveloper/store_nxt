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

// POST /api/cash-days - открыть или возобновить смену за сегодня
export async function POST() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ищем смену за сегодня
    let todayCashDay = await prisma.cashDay.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Если смены за сегодня нет - создаём новую
    if (!todayCashDay) {
      todayCashDay = await prisma.cashDay.create({
        data: {
          date: new Date(),
          isClosed: false,
          total: 0,
        },
      });
      return NextResponse.json({ 
        success: true, 
        data: todayCashDay,
        message: 'Новая кассовая смена открыта' 
      }, { status: 201 });
    }

    // Если смена за сегодня есть, но закрыта - открываем её снова и пересчитываем итог
    if (todayCashDay.isClosed) {
      // Пересчитываем итог из существующих событий
      const events = await prisma.cashEvent.findMany({
        where: { cashDayId: todayCashDay.id },
      });
      
      let total = 0;
      for (const event of events) {
        const amount = typeof event.totalAmount === 'number' 
          ? event.totalAmount 
          : parseFloat(event.totalAmount);
        
        if (!isNaN(amount)) {
          if (event.type === 'SALE' || event.type === 'INCOME') {
            total += amount;
          } else if (event.type === 'RETURN' || event.type === 'EXPENSE') {
            total -= amount;
          }
        }
      }
      
      const reopened = await prisma.cashDay.update({
        where: { id: todayCashDay.id },
        data: { isClosed: false, total },
      });
      return NextResponse.json({ 
        success: true, 
        data: reopened,
        message: 'Кассовая смена возобновлена' 
      });
    }

    // Если смена уже открыта
    return NextResponse.json({ 
      error: 'Смена уже открыта. Закройте её, чтобы начать новую.' 
    }, { status: 400 });
    
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
      return NextResponse.json({ error: 'Неверный параметр. Используйте action=close' }, { status: 400 });
    }

    // Находим открытую смену (любую, не обязательно сегодня)
    const openDay = await prisma.cashDay.findFirst({
      where: { isClosed: false },
    });

    if (!openDay) {
      return NextResponse.json({ error: 'Нет открытой смены' }, { status: 404 });
    }

    // Пересчитываем итог (числа, а не строки)
    const events = await prisma.cashEvent.findMany({
      where: { cashDayId: openDay.id },
    });

    let total = 0;
    for (const event of events) {
      const amount = typeof event.totalAmount === 'number' 
        ? event.totalAmount 
        : parseFloat(event.totalAmount);
      
      if (!isNaN(amount)) {
        if (event.type === 'SALE' || event.type === 'INCOME') {
          total += amount;
        } else if (event.type === 'RETURN' || event.type === 'EXPENSE') {
          total -= amount;
        }
      }
    }

    const closedDay = await prisma.cashDay.update({
      where: { id: openDay.id },
      data: { isClosed: true, total },
    });

    return NextResponse.json({ 
      success: true, 
      data: closedDay, 
      message: `Смена закрыта. Итог: ${total} руб.` 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}