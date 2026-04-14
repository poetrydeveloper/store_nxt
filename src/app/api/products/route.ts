// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
// Временный импорт без алиаса
import prisma from '../../../modules/shared/database/prisma.service'; 

export async function GET() {
  console.log('API /products: Начало запроса');
  if (!prisma) {
    console.error('API /products: prisma is undefined!');
    return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 });
  }
  try {
    const products = await prisma.product.findMany({
      include: { category: true, brand: true },
    });
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error('API /products: Ошибка', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}