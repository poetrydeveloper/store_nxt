// src/app/api/disassembly-scenarios/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// GET /api/disassembly-scenarios
export async function GET() {
  try {
    const scenarios = await prisma.disassemblyScenario.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: scenarios });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/disassembly-scenarios
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, parentProductCode, childProductCodes, partsCount, isActive } = body;

    const scenario = await prisma.disassemblyScenario.create({
      data: {
        name,
        parentProductCode,
        childProductCodes,
        partsCount,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: scenario }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/disassembly-scenarios?id=1
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, parentProductCode, childProductCodes, partsCount, isActive } = body;

    const scenario = await prisma.disassemblyScenario.update({
      where: { id: parseInt(id) },
      data: { name, parentProductCode, childProductCodes, partsCount, isActive },
    });

    return NextResponse.json({ success: true, data: scenario });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/disassembly-scenarios?id=1
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await prisma.disassemblyScenario.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, message: 'Сценарий удалён' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}