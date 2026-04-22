import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, categoryId, brandId } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Нет данных для импорта' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Не указана категория' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const item of products) {
      try {
        const existing = await prisma.product.findUnique({
          where: { code: item.code },
        });

        if (existing) {
          errors.push({ code: item.code, error: 'Артикул уже существует' });
          continue;
        }

        const product = await prisma.product.create({
          data: {
            code: item.code,
            name: item.name,
            description: item.description || '',
            categoryId: parseInt(categoryId),
            brandId: brandId ? parseInt(brandId) : null,
            galleryImages: [],
          },
        });
        results.push(product);
      } catch (error: any) {
        errors.push({ code: item.code, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Импортировано: ${results.length}, ошибок: ${errors.length}`,
      data: { results, errors },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
