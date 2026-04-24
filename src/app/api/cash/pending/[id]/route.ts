// src/app/api/cash/pending/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// PUT /api/cash/pending/:id - дооформить отложенную продажу
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;  // ← await params
    const body = await request.json();
    const { productId, quantity, purchasePrice, supplierId } = body;
    
    console.log('🔄 Дооформление продажи:', { id, productId, quantity });
    
    // Находим отложенную продажу
    const pendingSale = await prisma.pendingSale.findUnique({
      where: { id },
      include: { cashDay: true },
    });
    
    if (!pendingSale) {
      return NextResponse.json({ error: 'Отложенная продажа не найдена' }, { status: 404 });
    }
    
    if (pendingSale.status !== 'PENDING') {
      return NextResponse.json({ error: 'Продажа уже обработана' }, { status: 400 });
    }
    
    // Находим товар
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }
    
    // Проверяем, сколько единиц нужно создать/списать
    const currentStock = await prisma.productUnit.count({
      where: {
        productId,
        physicalStatus: 'IN_STORE',
        status: 'RECEIVED',
      },
    });
    
    const neededQuantity = pendingSale.tempQuantity;
    let createdUnits = [];
    let usedUnits = [];
    
    if (currentStock >= neededQuantity) {
      // Берём существующие юниты
      usedUnits = await prisma.productUnit.findMany({
        where: {
          productId,
          physicalStatus: 'IN_STORE',
          status: 'RECEIVED',
        },
        take: neededQuantity,
      });
    } else {
      // Нужно создать недостающие
      const toCreate = neededQuantity - currentStock;
      
      // Берём существующие
      usedUnits = await prisma.productUnit.findMany({
        where: {
          productId,
          physicalStatus: 'IN_STORE',
          status: 'RECEIVED',
        },
        take: currentStock,
      });
      
      // Создаём недостающие
      for (let i = 0; i < toCreate; i++) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const serialNumber = `${product.code}-RESOLVE-${timestamp}-${random}`;
        
        const newUnit = await prisma.productUnit.create({
          data: {
            uniqueSerialNumber: serialNumber,
            productId,
            purchasePrice: purchasePrice || null,
            supplierId: supplierId || null,
            status: 'RECEIVED',
            physicalStatus: 'IN_STORE',
            disassemblyStatus: 'MONOLITH',
            isReserved: false,
            isReturned: false,
          },
        });
        createdUnits.push(newUnit);
        usedUnits.push(newUnit);
      }
    }
    
    // Обновляем статус юнитов на SOLD
    for (const unit of usedUnits) {
      await prisma.productUnit.update({
        where: { id: unit.id },
        data: {
          physicalStatus: 'SOLD',
          salePrice: pendingSale.tempPrice,
          soldAt: new Date(),
          isReserved: false,
        },
      });
      
      await prisma.productUnitLog.create({
        data: {
          type: 'SALE',
          message: `Продано при дооформлении отложенной продажи: ${pendingSale.tempName}`,
          meta: { pendingSaleId: id, price: pendingSale.tempPrice },
          productUnitId: unit.id,
        },
      });
    }
    
    // Обновляем CashEvent (добавляем ссылку на товар/юнит)
    // Находим связанный CashEvent
    const cashEvent = await prisma.cashEvent.findFirst({
      where: {
        cashDayId: pendingSale.cashDayId,
        description: {
          startsWith: `⚡ БЫСТРАЯ ПРОДАЖА: ${pendingSale.tempName}`,
        },
      },
    });
    
    if (cashEvent) {
      // Обновляем описание, добавляя информацию о дооформлении
      await prisma.cashEvent.update({
        where: { id: cashEvent.id },
        data: {
          description: `${cashEvent.description} → ДООФОРМЛЕН: ${product.name} (${product.code})`,
        },
      });
      
      // Создаём CashEventItem для связки с ProductUnit
      for (const unit of usedUnits) {
        await prisma.cashEventItem.create({
          data: {
            quantity: 1,
            pricePerUnit: pendingSale.tempPrice,
            subtotal: pendingSale.tempPrice,
            cashEventId: cashEvent.id,
            productUnitId: unit.id,
          },
        });
      }
    }
    
    // Обновляем отложенную продажу
    const updated = await prisma.pendingSale.update({
      where: { id },
      data: {
        resolvedProductId: productId,
        resolvedAt: new Date(),
        status: 'RESOLVED',
      },
    });
    
    return NextResponse.json({
      success: true,
      data: { pendingSale: updated, cashEvent, createdUnits, usedUnits },
      message: `Продажа дооформлена, создано ${createdUnits.length} новых единиц`,
    });
  } catch (error: any) {
    console.error('Error resolving pending sale:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/cash/pending/:id - отменить отложенную продажу
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;  // ← await params
    
    const pendingSale = await prisma.pendingSale.findUnique({
      where: { id },
    });
    
    if (!pendingSale) {
      return NextResponse.json({ error: 'Отложенная продажа не найдена' }, { status: 404 });
    }
    
    // Обновляем статус
    const updated = await prisma.pendingSale.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    
    return NextResponse.json({ success: true, data: updated, message: 'Продажа отменена' });
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}