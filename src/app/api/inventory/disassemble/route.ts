// src/app/api/inventory/disassemble/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// POST /api/inventory/disassemble
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serialNumber, scenarioId } = body;

    // Находим родительскую единицу
    const parentUnit = await prisma.productUnit.findUnique({
      where: { uniqueSerialNumber: serialNumber },
      include: { product: true },
    });

    if (!parentUnit) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Проверяем, что товар можно разобрать
    if (parentUnit.disassemblyStatus !== 'MONOLITH') {
      return NextResponse.json({ error: 'Товар уже разобран или является частью коллекции' }, { status: 400 });
    }

    // Находим сценарий
    const scenario = await prisma.disassemblyScenario.findUnique({
      where: { id: scenarioId },
    });

    if (!scenario || !scenario.isActive) {
      return NextResponse.json({ error: 'Сценарий не найден или неактивен' }, { status: 404 });
    }

    // Проверяем соответствие товара сценарию
    if (scenario.parentProductCode !== parentUnit.product.code) {
      return NextResponse.json({ error: 'Сценарий не подходит для этого товара' }, { status: 400 });
    }

    // Создаём дочерние единицы
    const childUnits = [];
    const childCodes = scenario.childProductCodes as string[];
    
    for (let i = 0; i < scenario.partsCount; i++) {
      const childCode = childCodes[i] || `PART-${i + 1}`;
      const childUnit = await prisma.productUnit.create({
        data: {
          uniqueSerialNumber: `${parentUnit.uniqueSerialNumber}-PART-${i + 1}`,
          productId: parentUnit.productId,
          status: 'RECEIVED',
          physicalStatus: 'IN_COLLECTED',
          disassemblyStatus: 'PARTIAL',
          isReserved: false,
          isReturned: false,
          parentProductUnitId: parentUnit.id,
        },
      });
      childUnits.push(childUnit);
    }

    // Обновляем родительскую единицу
    const updatedParent = await prisma.productUnit.update({
      where: { id: parentUnit.id },
      data: {
        physicalStatus: 'IN_DISASSEMBLED',
        disassemblyStatus: 'DISASSEMBLED',
        isReserved: true,
      },
    });

    // Логируем
    await prisma.productUnitLog.create({
      data: {
        type: 'DISASSEMBLE',
        message: `Разобрано на ${childUnits.length} частей по сценарию ${scenario.name}`,
        meta: { scenarioId, partsCount: childUnits.length },
        productUnitId: parentUnit.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Товар ${serialNumber} разобран на ${childUnits.length} частей`,
      data: { parent: updatedParent, children: childUnits },
    });
  } catch (error: any) {
    console.error('Ошибка при разборке:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}