// src/app/api/inventory/collect/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentProductCode, parentSerialNumber } = body;

    if (!parentProductCode && !parentSerialNumber) {
      return NextResponse.json({ 
        error: 'Укажите parentProductCode или parentSerialNumber' 
      }, { status: 400 });
    }

    // 1. Находим сценарий
    const scenario = await prisma.disassemblyScenario.findFirst({
      where: { parentProductCode, isActive: true },
    });

    if (!scenario) {
      return NextResponse.json({ error: 'Сценарий разборки не найден' }, { status: 404 });
    }

    const childCodes = scenario.childProductCodes as string[];

    // 2. Проверяем наличие всех частиц в магазине
    const availableChildren = await prisma.productUnit.findMany({
      where: {
        product: { code: { in: childCodes } },
        physicalStatus: 'IN_STORE',
        status: 'RECEIVED',
      },
      include: { product: true },
    });

    // Группируем по артикулу
    const availableByCode: Record<string, any[]> = {};
    availableChildren.forEach(child => {
      const code = child.product.code;
      if (!availableByCode[code]) availableByCode[code] = [];
      availableByCode[code].push(child);
    });

    // Проверяем, есть ли все артикулы
    const missingCodes: string[] = [];
    for (const code of childCodes) {
      if (!availableByCode[code] || availableByCode[code].length === 0) {
        missingCodes.push(code);
      }
    }

    if (missingCodes.length > 0) {
      return NextResponse.json({
        error: 'Не хватает частиц для сборки',
        missingCodes,
        requiredCodes: childCodes,
      }, { status: 400 });
    }

    // 3. Находим родительский юнит
    let parentUnit;
    
    if (parentSerialNumber) {
      parentUnit = await prisma.productUnit.findFirst({
        where: {
          uniqueSerialNumber: parentSerialNumber,
          physicalStatus: 'IN_DISASSEMBLED',
          disassemblyStatus: 'DISASSEMBLED',
        },
        include: { product: true },  // ← добавили include
      });
    } else {
      parentUnit = await prisma.productUnit.findFirst({
        where: {
          product: { code: parentProductCode },
          physicalStatus: 'IN_DISASSEMBLED',
          disassemblyStatus: 'DISASSEMBLED',
        },
        orderBy: { createdAt: 'asc' },
        include: { product: true },  // ← добавили include
      });
    }

    if (!parentUnit) {
      return NextResponse.json({ error: 'Нет разобранных наборов для сборки' }, { status: 404 });
    }

    // 4. Собираем частицы (по одной каждого типа)
    const collectedChildren: any[] = [];
    for (const code of childCodes) {
      const child = availableByCode[code][0];
      const updated = await prisma.productUnit.update({
        where: { id: child.id },
        data: {
          physicalStatus: 'ABSORBED',
          disassemblyStatus: 'COLLECTED',
          isReserved: true,
          parentProductUnitId: parentUnit.id,
        },
      });
      collectedChildren.push(updated);
    }

    // 5. Восстанавливаем родителя
    const restoredParent = await prisma.productUnit.update({
      where: { id: parentUnit.id },
      data: {
        physicalStatus: 'IN_STORE',
        disassemblyStatus: 'MONOLITH',
        isReserved: false,
      },
    });

    // 6. Логируем - используем parentProductCode вместо parentUnit.product.code
    await prisma.productUnitLog.create({
      data: {
        type: 'COLLECT',
        message: `Собран набор ${parentProductCode} из ${collectedChildren.length} частей`,
        meta: { 
          parentUnitId: parentUnit.id, 
          childUnitIds: collectedChildren.map(c => c.id),
          childCodes: childCodes,
        },
        productUnitId: parentUnit.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Набор ${parentProductCode} собран из ${collectedChildren.length} частей`,
      data: { parent: restoredParent, children: collectedChildren },
    });
  } catch (error: any) {
    console.error('Ошибка при сборке:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}