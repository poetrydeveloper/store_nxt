// src/app/api/inventory/receive/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// POST /api/inventory/receive - принять товар
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { unitId } = body;

    const unit = await prisma.productUnit.findUnique({
      where: { id: unitId },
      include: { order: true, product: true },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Единица товара не найдена' }, { status: 404 });
    }

    if (unit.status !== 'IN_REQUEST') {
      return NextResponse.json({ error: 'Товар не в статусе заказа' }, { status: 400 });
    }

    // Цена закупки уже есть из заказа, просто меняем статус
    const updated = await prisma.productUnit.update({
      where: { id: unitId },
      data: {
        status: 'RECEIVED',
        physicalStatus: 'IN_STORE',
        isReserved: false,
      },
    });

    await prisma.productUnitLog.create({
      data: {
        type: 'STATUS_CHANGE',
        message: `Товар принят на склад`,
        meta: { unitId, orderId: unit.orderId },
        productUnitId: unit.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: `Товар ${unit.uniqueSerialNumber} принят на склад`
    });
  } catch (error: any) {
    console.error('POST /api/inventory/receive error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}