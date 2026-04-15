// src/app/api/debt-tracking/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/debt-tracking?customerId=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    }

    let debtTracking = await prisma.debtTracking.findUnique({
      where: { customerId: parseInt(customerId) },
    });

    if (!debtTracking) {
      // Создаём если нет
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) },
      });

      if (!customer) {
        return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
      }

      debtTracking = await prisma.debtTracking.create({
        data: {
          customerId: parseInt(customerId),
          totalOwed: 0,
          totalPaid: 0,
          currentDebt: 0,
        },
      });
    }

    return NextResponse.json({ success: true, data: debtTracking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/debt-tracking?customerId=1 - обновить долг
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    }

    const body = await request.json();
    const { totalOwed, totalPaid } = body;

    const currentDebt = totalOwed - totalPaid;

    const debtTracking = await prisma.debtTracking.upsert({
      where: { customerId: parseInt(customerId) },
      update: { totalOwed, totalPaid, currentDebt },
      create: {
        customerId: parseInt(customerId),
        totalOwed,
        totalPaid,
        currentDebt,
      },
    });

    // Обновляем баланс покупателя
    await prisma.customer.update({
      where: { id: parseInt(customerId) },
      data: { balance: -currentDebt },
    });

    return NextResponse.json({ success: true, data: debtTracking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/debt-tracking?customerId=1&action=remind - отправить напоминание
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const action = searchParams.get('action');

    if (!customerId || action !== 'remind') {
      return NextResponse.json({ error: 'customerId and action=remind required' }, { status: 400 });
    }

    const debtTracking = await prisma.debtTracking.findUnique({
      where: { customerId: parseInt(customerId) },
      include: { customer: true },
    });

    if (!debtTracking || debtTracking.currentDebt <= 0) {
      return NextResponse.json({ error: 'Нет долга для напоминания' }, { status: 400 });
    }

    // Обновляем дату последнего напоминания
    await prisma.debtTracking.update({
      where: { customerId: parseInt(customerId) },
      data: { lastReminderSent: new Date() },
    });

    // Здесь можно добавить отправку email/SMS
    const message = `Уважаемый ${debtTracking.customer.name}, ваш долг составляет ${debtTracking.currentDebt} руб.`;

    return NextResponse.json({
      success: true,
      message,
      data: debtTracking,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}