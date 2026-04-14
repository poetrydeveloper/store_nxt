import { NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, image, level, parentId } = body;
    
    const category = await prisma.category.create({
      data: { name, slug, description, image, level, parentId },
    });
    
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
