// src/app/api/orders/route.ts - ПОЛНАЯ ВЕРСИЯ

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// Генератор номера заказа
const generateOrderNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const todayStart = new Date(year, date.getMonth(), day);
  const tomorrowStart = new Date(year, date.getMonth(), day + 1);
  
  const count = await prisma.order.count({
    where: {
      orderDate: {
        gte: todayStart,
        lt: tomorrowStart,
      },
    },
  });
  
  const seq = (count + 1).toString().padStart(3, '0');
  return `ORD-${year}${month}${day}-${seq}`;
};

// Генератор серийного номера для ProductUnit
const generateSerialNumber = (productCode: string, index: number): string => {
  const date = new Date();
  const timestamp = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0') +
                   date.getHours().toString().padStart(2, '0') +
                   date.getMinutes().toString().padStart(2, '0') +
                   date.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${productCode}-${timestamp}-${random}-${index}`;
};

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: { 
          productUnits: { 
            include: { product: true, supplier: true } 
          } 
        },
      });
      
      if (!order) {
        return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: order });
    }
    
    const orders = await prisma.order.findMany({
      include: { 
        productUnits: { 
          include: { product: true },
          orderBy: { createdAt: 'asc' }
        } 
      },
      orderBy: { orderDate: 'desc' },
    });
    
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { expectedDeliveryDate, items } = body;

    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        orderDate: new Date(),
      },
    });

    let serialIndex = 0;
    const createdUnits = [];
    
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        const serialNumber = generateSerialNumber(item.productCode, serialIndex++);
        
        const unit = await prisma.productUnit.create({
          data: {
            uniqueSerialNumber: serialNumber,
            productId: item.productId,
            purchasePrice: item.purchasePrice,  // ← цена из заказа
            status: 'IN_REQUEST',
            physicalStatus: 'IN_STORE',
            disassemblyStatus: 'MONOLITH',
            isReserved: true,
            isReturned: false,
            orderId: order.id,
            supplierId: item.supplierId || null,
          },
          include: { product: true },
        });
        createdUnits.push(unit);
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { order, units: createdUnits },
      message: `Создан заказ ${orderNumber} на ${createdUnits.length} единиц товара`
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}