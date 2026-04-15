// src/app/api/prepayments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/prepayments?orderId=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const prepayment = await prisma.prepayment.findUnique({
      where: { orderId: parseInt(orderId) },
    });

    return NextResponse.json({ success: true, data: prepayment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/prepayments - создать предоплату
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, deadline, orderId } = body;

    const prepayment = await prisma.prepayment.create({
      data: {
        amount,
        deadline: new Date(deadline),
        remainingDebt: amount,
        isFullyPaid: false,
        orderId,
      },
    });

    // Обновляем статус заказа
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'AWAITING_PAYMENT' },
    });

    return NextResponse.json({ success: true, data: prepayment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/prepayments?orderId=1 - обновить предоплату
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const body = await request.json();
    const { amount, deadline } = body;

    const prepayment = await prisma.prepayment.update({
      where: { orderId: parseInt(orderId) },
      data: {
        amount,
        deadline: deadline ? new Date(deadline) : undefined,
        remainingDebt: amount,
      },
    });

    return NextResponse.json({ success: true, data: prepayment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}