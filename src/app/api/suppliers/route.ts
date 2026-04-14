// src/app/api/suppliers/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/suppliers
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany();
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/suppliers
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contactPerson, phone, email, address } = body;
    
    const supplier = await prisma.supplier.create({
      data: { name, contactPerson, phone, email, address },
    });
    
    return NextResponse.json({ success: true, data: supplier }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}