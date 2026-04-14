// src/app/api/categories/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

export async function GET() {
  console.log('API /categories: Начало запроса');
  try {
    const categories = await prisma.category.findMany({
      orderBy: { level: 'asc' },
    });
    console.log('API /categories: Найдено категорий:', categories.length);
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('API /categories: Ошибка:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, image, level, parentId } = body;
    
    const category = await prisma.category.create({
      data: { 
        name, 
        slug, 
        description, 
        image, 
        level: level || 0, 
        parentId: parentId || undefined 
      },
    });
    
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('API /categories POST: Ошибка:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
