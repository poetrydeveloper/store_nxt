import { NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany();
    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, logo, description } = body;
    
    const brand = await prisma.brand.create({
      data: { name, logo, description },
    });
    
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
