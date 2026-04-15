// src/app/api/customers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/customers - список всех покупателей
// GET /api/customers?id=1 - один покупатель
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!customer) {
        return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: customer });
    }
    
    const customers = await prisma.customer.findMany();
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/customers - создать покупателя
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, address, balance } = body;
    
    const customer = await prisma.customer.create({
      data: { name, phone, email, address, balance: balance || 0 },
    });
    
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/customers?id=1 - обновить покупателя
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    
    const body = await request.json();
    const { name, phone, email, address, balance } = body;
    
    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { name, phone, email, address, balance },
    });
    
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/customers?id=1 - удалить покупателя
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    
    await prisma.customer.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true, message: 'Покупатель удалён' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}