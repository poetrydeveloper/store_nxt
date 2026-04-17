// src/app/api/categories/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { level: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('API /categories GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📥 Received body:', JSON.stringify(body, null, 2));
    
    let { name, slug, description, image, level, parentId } = body;
    
    console.log('📝 Parsed values:', { name, slug, description, level, parentId });
    
    // Если slug пустой или undefined - генерируем из name
    if (!slug || slug === '') {
      slug = name
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      console.log('🔨 Generated slug:', slug);
    }
    
    // Убеждаемся, что slug не пустой
    if (!slug || slug === '') {
      slug = `category-${Date.now()}`;
      console.log('⚠️ Fallback slug:', slug);
    }
    
    console.log('💾 Attempting to create category with slug:', slug);
    
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
    
    console.log('✅ Category created:', category.id);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('❌ API /categories POST error:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}