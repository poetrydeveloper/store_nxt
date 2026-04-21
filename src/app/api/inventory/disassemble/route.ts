// src/app/api/inventory/disassemble/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/modules/shared/database/prisma.service';

// Функция поиска товара по артикулу
async function findProductByCode(code: string) {
  const product = await prisma.product.findUnique({
    where: { code: code },
  });
  
  if (!product) {
    throw new Error(`Товар с артикулом "${code}" не найден. Сначала создайте товар.`);
  }
  
  return product;
}

// Генерация уникального серийного номера для частицы
function generateUniqueSerialNumber(parentSerial: string, partIndex: number): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${parentSerial}-PART-${partIndex + 1}-${timestamp}-${random}`;
}

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

    // Получаем массив артикулов частей
    const childCodes = scenario.childProductCodes as string[];
    
    if (childCodes.length !== scenario.partsCount) {
      console.warn(`Предупреждение: количество артикулов (${childCodes.length}) не совпадает с partsCount (${scenario.partsCount})`);
    }

    // Создаём дочерние единицы
    const childUnits = [];
    
    for (let i = 0; i < childCodes.length; i++) {
      const childCode = childCodes[i];
      
      // Находим товар по артикулу
      let childProduct;
      try {
        childProduct = await findProductByCode(childCode);
      } catch (error: any) {
        return NextResponse.json({ 
          error: error.message,
          details: `Артикул "${childCode}" не найден в системе. Сначала создайте товар с таким артикулом.`
        }, { status: 400 });
      }
      
      // Генерируем уникальный серийный номер
      const uniqueSerial = generateUniqueSerialNumber(parentUnit.uniqueSerialNumber, i);
      
      // Создаём дочерний ProductUnit
      const childUnit = await prisma.productUnit.create({
        data: {
          uniqueSerialNumber: uniqueSerial,
          productId: childProduct.id,
          status: 'RECEIVED',
          physicalStatus: 'IN_STORE',
          disassemblyStatus: 'PARTIAL',
          isReserved: false,
          isReturned: false,
          parentProductUnitId: parentUnit.id,
        },
        include: { product: true },
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
        meta: { scenarioId, partsCount: childUnits.length, childCodes },
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