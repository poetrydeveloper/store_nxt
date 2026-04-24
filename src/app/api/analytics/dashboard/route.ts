// src/app/api/analytics/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Все юниты на складе
    const allUnits = await prisma.productUnit.findMany({
      where: { physicalStatus: 'IN_STORE', status: 'RECEIVED' },
      include: { product: true },
    });

    const totalUnits = allUnits.length;
    const totalValueInStore = allUnits.reduce((sum, u) => sum + (Number(u.purchasePrice) || 0), 0);

    // 2. Продажи за период
    const sales = await prisma.cashEvent.findMany({
      where: {
        type: 'SALE',
        createdAt: { gte: startDate },
      },
      include: { items: { include: { productUnit: { include: { product: true } } } } },
    });

    const totalSoldValue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const totalSoldCount = sales.reduce((sum, s) => sum + (s.items?.[0]?.quantity || 0), 0);

    // 3. Заказанные товары
    const orderedUnits = await prisma.productUnit.findMany({
      where: { status: 'IN_REQUEST' },
      include: { product: true },
    });
    const totalOrderedValue = orderedUnits.reduce((sum, u) => sum + (Number(u.purchasePrice) || 0), 0);

    // 4. Топ товаров
    const productSales: Record<number, { name: string; code: string; sold: number; revenue: number }> = {};
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        const productId = item.productUnit?.productId;
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.productUnit?.product?.name || 'Unknown',
              code: item.productUnit?.product?.code || '',
              sold: 0,
              revenue: 0,
            };
          }
          productSales[productId].sold += item.quantity;
          productSales[productId].revenue += Number(item.subtotal);
        }
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

    // 5. Динамика по дням
    const dailyTrend: Record<string, { sold: number; revenue: number }> = {};
    sales.forEach(sale => {
      const day = new Date(sale.createdAt).toISOString().slice(0, 10);
      if (!dailyTrend[day]) dailyTrend[day] = { sold: 0, revenue: 0 };
      dailyTrend[day].sold += sale.items?.[0]?.quantity || 0;
      dailyTrend[day].revenue += Number(sale.totalAmount);
    });

    // 6. Распределение по категориям
    const categorySales: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        const categoryName = item.productUnit?.product?.category?.name;
        if (categoryName) {
          categorySales[categoryName] = (categorySales[categoryName] || 0) + Number(item.subtotal);
        }
      });
    });

    // 7. Товары с низким остатком (менее 3)
    const lowStockProducts = allUnits
      .filter(u => u.physicalStatus === 'IN_STORE')
      .reduce((acc, u) => {
        const productId = u.productId;
        if (!acc[productId]) {
          acc[productId] = { name: u.product.name, code: u.product.code, stock: 0 };
        }
        acc[productId].stock++;
        return acc;
      }, {} as Record<number, { name: string; code: string; stock: number }>);
    
    const lowStock = Object.values(lowStockProducts).filter(p => p.stock < 3);

    return NextResponse.json({
      success: true,
      data: {
        totalUnits,
        totalValueInStore,
        totalSoldValue,
        totalSoldCount,
        totalOrderedValue,
        topProducts: topProducts.slice(0, 10),
        dailyTrend: Object.entries(dailyTrend).map(([date, data]) => ({ date, ...data })),
        categoryDistribution: Object.entries(categorySales).map(([name, value]) => ({ name, value })),
        lowStock,
      },
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}