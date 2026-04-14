// src/app/api/product-images/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/product-images?productId=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }
    
    const images = await prisma.productImage.findMany({
      where: { productId: parseInt(productId) },
      orderBy: { sortOrder: 'asc' },
    });
    
    return NextResponse.json({ success: true, data: images });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/product-images?productId=1
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }
    
    const body = await request.json();
    const { url, sortOrder } = body;
    
    const imageUrl = url || `/api/placeholder?w=200&h=200&text=Product+Image`;
    
    const image = await prisma.productImage.create({
      data: {
        productId: parseInt(productId),
        url: imageUrl,
        storageType: url ? 'local' : 'placeholder',
        sortOrder: sortOrder || 0,
      },
    });
    
    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/product-images?imageId=1
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    
    if (!imageId) {
      return NextResponse.json({ error: 'imageId required' }, { status: 400 });
    }
    
    await prisma.productImage.delete({
      where: { id: parseInt(imageId) },
    });
    
    return NextResponse.json({ success: true, message: 'Image deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}