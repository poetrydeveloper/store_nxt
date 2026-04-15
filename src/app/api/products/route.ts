// src/app/api/products/route.ts - ПОЛНАЯ ВЕРСИЯ

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/products - список всех товаров
// GET /api/products?id=1 - один товар
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Получить один товар
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: { category: true, brand: true, images: true },
      });
      
      if (!product) {
        return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: product });
    }
    
    // Получить все товары
    const products = await prisma.product.findMany({
      include: { category: true, brand: true },
    });
    
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/products - создать товар
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, brandId, code, name, description, mainImage, galleryImages } = body;
    
    const product = await prisma.product.create({
      data: { categoryId, brandId, code, name, description, mainImage, galleryImages: galleryImages || [] },
    });
    
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/products?id=1 - обновить товар
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    
    const body = await request.json();
    const { categoryId, brandId, code, name, description, mainImage, galleryImages } = body;
    
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { categoryId, brandId, code, name, description, mainImage, galleryImages },
    });
    
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/products?id=1 - удалить товар
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true, message: 'Товар удалён' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}