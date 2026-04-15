// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/orders - список заказов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: { productUnits: { include: { product: true } } },
      });
      
      if (!order) {
        return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: order });
    }
    
    const orders = await prisma.order.findMany({
      include: { productUnits: { take: 5 } },
      orderBy: { orderDate: 'desc' },
    });
    
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/orders - создать заказ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, expectedDeliveryDate, items } = body;
    
    // Создаём заказ
    const order = await prisma.order.create({
      data: {
        orderNumber,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
      },
    });
    
    // Создаём ProductUnit для каждого товара в заказе
    if (items && items.length > 0) {
      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          await prisma.productUnit.create({
            data: {
              uniqueSerialNumber: `${item.productCode}-${Date.now()}-${i}`,
              productId: item.productId,
              status: 'IN_REQUEST',
              physicalStatus: 'IN_STORE',
              disassemblyStatus: 'MONOLITH',
              isReserved: true,
              isReturned: false,
              orderId: order.id,
              supplierId: item.supplierId,
            },
          });
        }
      }
    }
    
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/orders?id=1 - обновить статус заказа
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    
    const body = await request.json();
    const { expectedDeliveryDate } = body;
    
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null },
    });
    
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/orders?id=1 - удалить заказ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    
    await prisma.order.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true, message: 'Заказ удалён' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}