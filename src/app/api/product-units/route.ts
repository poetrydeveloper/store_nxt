// src/app/api/product-units/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/product-units - список всех единиц товара
// GET /api/product-units?productId=1 - единицы конкретного товара
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const serialNumber = searchParams.get('serialNumber');
    
    if (serialNumber) {
      const unit = await prisma.productUnit.findUnique({
        where: { uniqueSerialNumber: serialNumber },
        include: { product: true, customer: true, supplier: true },
      });
      
      if (!unit) {
        return NextResponse.json({ error: 'Единица товара не найдена' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: unit });
    }
    
    const where = productId ? { productId: parseInt(productId) } : {};
    
    const units = await prisma.productUnit.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, data: units });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/product-units - создать единицу товара
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, uniqueSerialNumber, purchasePrice, supplierId } = body;
    
    // Проверяем, не существует ли уже такой серийный номер
    const existing = await prisma.productUnit.findUnique({
      where: { uniqueSerialNumber },
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Серийный номер уже существует' }, { status: 400 });
    }
    
    const unit = await prisma.productUnit.create({
      data: {
        productId,
        uniqueSerialNumber,
        purchasePrice: purchasePrice || null,
        supplierId: supplierId || null,
        status: 'RECEIVED',
        physicalStatus: 'IN_STORE',
        disassemblyStatus: 'MONOLITH',
        isReserved: false,
        isReturned: false,
      },
    });
    
    return NextResponse.json({ success: true, data: unit }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}