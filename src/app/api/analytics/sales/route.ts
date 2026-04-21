// src/app/api/analytics/sales/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Находим все продажи за указанный период
    const sales = await prisma.cashEvent.findMany({
      where: {
        type: 'SALE',
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: {
          include: {
            productUnit: true,
          },
        },
      },
    });
    
    // Группируем по productId
    const salesByProduct: Record<number, number> = {};
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        const productId = item.productUnit?.productId;
        if (productId) {
          salesByProduct[productId] = (salesByProduct[productId] || 0) + item.quantity;
        }
      });
    });
    
    return NextResponse.json({ 
      success: true, 
      data: salesByProduct,
      period: days,
      startDate: startDate.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}