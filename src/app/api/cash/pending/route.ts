// src/app/api/cash/pending/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/cash/pending
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    
    const pendingSales = await prisma.pendingSale.findMany({
      where: { status: status as any },
      include: {
        cashDay: true,
        resolvedProduct: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, data: pendingSales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/cash/pending - создать отложенную продажу
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tempName, tempPrice, tempQuantity, tempCategoryName, tempBrandName, cashDayId } = body;
    
    console.log('📥 POST /api/cash/pending:', { tempName, tempPrice, tempQuantity, cashDayId });
    
    if (!tempName || !tempPrice || !cashDayId) {
      return NextResponse.json({ error: 'Не хватает обязательных полей' }, { status: 400 });
    }
    
    // Проверяем, что кассовый день открыт
    const cashDay = await prisma.cashDay.findUnique({
      where: { id: cashDayId },
    });
    
    if (!cashDay || cashDay.isClosed) {
      return NextResponse.json({ error: 'Кассовый день закрыт или не существует' }, { status: 400 });
    }
    
    // 1. Создаём отложенную продажу
    const pendingSale = await prisma.pendingSale.create({
      data: {
        tempName,
        tempPrice,
        tempQuantity: tempQuantity || 1,
        tempCategoryName,
        tempBrandName,
        cashDayId,
        status: 'PENDING',
      },
    });
    
    console.log('✅ PendingSale created:', pendingSale.id);
    
    // 2. Сразу создаём CashEvent (кассовое событие)
    const totalAmount = tempPrice * (tempQuantity || 1);
    
    const cashEvent = await prisma.cashEvent.create({
      data: {
        type: 'SALE',
        totalAmount,
        description: `⚡ БЫСТРАЯ ПРОДАЖА: ${tempName} x${tempQuantity || 1}`,
        paymentMethod: 'CASH',
        createdBy: 'system',
        cashDayId,
      },
    });
    
    console.log('✅ CashEvent created:', cashEvent.id);
    
    // 3. Обновляем итог кассового дня
    const allEvents = await prisma.cashEvent.findMany({
      where: { cashDayId },
    });
    const total = allEvents.reduce((sum, e) => sum + Number(e.totalAmount), 0);
    await prisma.cashDay.update({
      where: { id: cashDayId },
      data: { total },
    });
    
    return NextResponse.json({ 
      success: true, 
      data: { pendingSale, cashEvent },
      message: `Продажа отложена! Создано кассовое событие на ${totalAmount} ₽`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/cash/pending?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    
    console.log('🗑️ DELETE /api/cash/pending?id=', id);
    
    const pendingSale = await prisma.pendingSale.findUnique({
      where: { id },
    });
    
    if (!pendingSale) {
      return NextResponse.json({ error: 'Отложенная продажа не найдена' }, { status: 404 });
    }
    
    // Удаляем связанный CashEvent (быструю продажу)
    await prisma.cashEvent.deleteMany({
      where: {
        description: {
          startsWith: '⚡ БЫСТРАЯ ПРОДАЖА:',
        },
        cashDayId: pendingSale.cashDayId,
        createdAt: pendingSale.createdAt,
      },
    });
    
    console.log('✅ CashEvent deleted');
    
    // Обновляем итог кассового дня
    const allEvents = await prisma.cashEvent.findMany({
      where: { cashDayId: pendingSale.cashDayId },
    });
    const total = allEvents.reduce((sum, e) => sum + Number(e.totalAmount), 0);
    await prisma.cashDay.update({
      where: { id: pendingSale.cashDayId },
      data: { total },
    });
    
    // Удаляем отложенную продажу
    await prisma.pendingSale.delete({
      where: { id },
    });
    
    console.log('✅ PendingSale deleted');
    
    return NextResponse.json({ success: true, message: 'Отложенная продажа удалена' });
  } catch (error: any) {
    console.error('❌ DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}