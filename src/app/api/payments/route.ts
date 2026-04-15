// src/app/api/payments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/payments?customerId=1 - платежи покупателя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const orderId = searchParams.get('orderId');

    if (!customerId && !orderId) {
      return NextResponse.json({ error: 'customerId or orderId required' }, { status: 400 });
    }

    const where: any = {};
    if (customerId) where.customerId = parseInt(customerId);
    if (orderId) where.orderId = parseInt(orderId);

    const payments = await prisma.payment.findMany({
      where,
      include: { customer: true, order: true },
      orderBy: { paymentDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/payments - создать платёж
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, paymentDate, method, status, notes, customerId, orderId } = body;

    // Создаём платёж
    const payment = await prisma.payment.create({
      data: {
        amount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        method,
        status: status || 'COMPLETED',
        notes,
        customerId,
        orderId: orderId || null,
      },
    });

    // Обновляем баланс покупателя
    await prisma.customer.update({
      where: { id: customerId },
      data: { balance: { increment: amount } },
    });

    // Если есть DebtTracking, обновляем
    const debtTracking = await prisma.debtTracking.findUnique({
      where: { customerId },
    });

    if (debtTracking) {
      const totalPaid = debtTracking.totalPaid + amount;
      const currentDebt = debtTracking.totalOwed - totalPaid;
      await prisma.debtTracking.update({
        where: { customerId },
        data: { totalPaid, currentDebt },
      });
    }

    // Если платёж относится к заказу, обновляем статус заказа
    if (orderId) {
      const orderPayments = await prisma.payment.findMany({
        where: { orderId },
      });
      const totalPaid = orderPayments.reduce((sum, p) => sum + p.amount, 0);

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { prepayment: true },
      });

      if (order) {
        let orderStatus = 'AWAITING_PAYMENT';
        const prepaymentAmount = order.prepayment?.amount || 0;

        if (totalPaid >= order.prepayment?.amount) {
          orderStatus = 'FULLY_PAID';
        } else if (totalPaid > 0) {
          orderStatus = 'PARTIALLY_PAID';
        }

        await prisma.order.update({
          where: { id: orderId },
          data: { status: orderStatus },
        });
      }
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}