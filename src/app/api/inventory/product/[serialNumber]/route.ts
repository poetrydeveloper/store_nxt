// src/app/api/inventory/product/[serialNumber]/route.ts
// API endpoint для получения информации о товаре по серийному номеру

import { NextRequest, NextResponse } from 'next/server';
import { ProductUnitRepository } from '@/modules/inventory/infrastructure/prisma/product-unit.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { serialNumber: string } }
) {
  try {
    const { serialNumber } = params;

    if (!serialNumber) {
      return NextResponse.json(
        { error: 'Серийный номер обязателен' },
        { status: 400 }
      );
    }

    const repository = new ProductUnitRepository();
    const productUnit = await repository.findBySerial(serialNumber);

    if (!productUnit) {
      return NextResponse.json(
        { error: `Товар с номером ${serialNumber} не найден` },
        { status: 404 }
      );
    }

    // Возвращаем информацию о товаре
    return NextResponse.json({
      success: true,
      data: {
        serialNumber: productUnit.getUniqueSerialNumber(),
        physicalStatus: productUnit.getPhysicalStatus(),
        disassemblyStatus: productUnit.getDisassemblyStatus(),
        isReserved: productUnit.isReserved(),
        logs: productUnit.getLogs()
      }
    });

  } catch (error: any) {
    console.error('Ошибка при получении товара:', error);
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}