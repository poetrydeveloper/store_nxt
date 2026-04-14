// src/modules/inventory/application/use-cases/sell-product.usecase.ts

import { ProductUnitRepository } from '../../infrastructure/prisma/product-unit.repository';
import prisma from '@/modules/shared/database/prisma.service';

interface SellProductCommand {
  serialNumber: string;
  price: number;
  cashDayId: number;
  createdBy: string;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
}

export class SellProductUseCase {
  constructor(private productUnitRepository: ProductUnitRepository) {}

  async execute(command: SellProductCommand): Promise<void> {
    // 1. Находим товар по серийному номеру
    const productUnit = await this.productUnitRepository.findBySerial(command.serialNumber);
    
    if (!productUnit) {
      throw new Error(`Товар с номером ${command.serialNumber} не найден`);
    }
    
    // 2. Выполняем бизнес-логику продажи (метод из Entity)
    productUnit.sell(command.price, command.cashDayId);
    
    // 3. Сохраняем изменения в базе данных
    await this.productUnitRepository.save(productUnit);
    
    // 4. Сохраняем логи
    await this.productUnitRepository.updateLogs(productUnit.getId()!, productUnit.getLogs());
    
    // 5. Создаём кассовое событие
    await prisma.cashEvent.create({
      data: {
        type: 'SALE',
        totalAmount: command.price,
        description: `Продажа товара ${command.serialNumber}`,
        paymentMethod: command.paymentMethod,
        createdBy: command.createdBy,
        cashDayId: command.cashDayId,
        items: {
          create: {
            quantity: 1,
            pricePerUnit: command.price,
            subtotal: command.price,
            productUnitId: productUnit.getId()!,
          },
        },
      },
    });
    
    console.log(`✅ Товар ${command.serialNumber} успешно продан за ${command.price} руб.`);
  }
}