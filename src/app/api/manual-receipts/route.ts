// src/app/api/manual-receipts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/manual-receipts - список ручных приёмов
export async function GET() {
  try {
    const receipts = await prisma.manualReceipt.findMany({
      include: { productUnit: true },
      orderBy: { receiptDate: 'desc' },
    });
    
    return NextResponse.json({ success: true, data: receipts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/manual-receipts - создать ручной приём
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, uniqueSerialNumber, acceptedBy, comment, pricePending } = body;
    
    // Создаём запись о ручном приёме
    const receipt = await prisma.manualReceipt.create({
      data: {
        acceptedBy,
        comment,
        pricePending: pricePending !== undefined ? pricePending : true,
      },
    });
    
    // Создаём единицу товара
    const productUnit = await prisma.productUnit.create({
      data: {
        uniqueSerialNumber,
        productId,
        status: 'RECEIVED',
        physicalStatus: 'IN_STORE',
        disassemblyStatus: 'MONOLITH',
        isReserved: false,
        isReturned: false,
        manualReceiptId: receipt.id,
      },
    });
    
    // Логируем
    await prisma.productUnitLog.create({
      data: {
        type: 'MANUAL_RECEIPT',
        message: `Товар принят вручную: ${comment || 'без комментария'}`,
        meta: { acceptedBy, pricePending },
        productUnitId: productUnit.id,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      data: { receipt, productUnit },
      message: pricePending ? 'Цена будет указана позже' : 'Товар принят'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/manual-receipts?receiptId=1 - установить цену позже
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const receiptId = searchParams.get('receiptId');
    
    if (!receiptId) {
      return NextResponse.json({ error: 'receiptId required' }, { status: 400 });
    }
    
    const body = await request.json();
    const { price } = body;
    
    // Находим связанный ProductUnit
    const receipt = await prisma.manualReceipt.findUnique({
      where: { id: parseInt(receiptId) },
      include: { productUnit: true },
    });
    
    if (!receipt || !receipt.productUnit) {
      return NextResponse.json({ error: 'Приём не найден' }, { status: 404 });
    }
    
    // Обновляем цену товара
    await prisma.productUnit.update({
      where: { id: receipt.productUnit.id },
      data: { purchasePrice: price },
    });
    
    // Обновляем статус приёма
    await prisma.manualReceipt.update({
      where: { id: parseInt(receiptId) },
      data: { pricePending: false },
    });
    
    // Логируем
    await prisma.productUnitLog.create({
      data: {
        type: 'PRICE_UPDATE',
        message: `Установлена цена закупки: ${price} руб.`,
        meta: { price },
        productUnitId: receipt.productUnit.id,
      },
    });
    
    return NextResponse.json({ success: true, message: 'Цена установлена' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}