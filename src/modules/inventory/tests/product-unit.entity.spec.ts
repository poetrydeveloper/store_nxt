// src/modules/inventory/tests/product-unit.entity.spec.ts

import { ProductUnit, PhysicalStatus, UnitDisassemblyStatus, StatusEnum, LogEventType } from '../domain/entities/product-unit.entity';

describe('ProductUnit - Бизнес-логика товара', () => {
  const createProductUnit = () => {
    return new ProductUnit({
      uniqueSerialNumber: 'TEST-001',
      purchasePrice: 1000,
      isReserved: false,
      createdAt: new Date(),
      status: StatusEnum.RECEIVED,
      physicalStatus: PhysicalStatus.IN_STORE,
      disassemblyStatus: UnitDisassemblyStatus.MONOLITH,
      isReturned: false,
      productId: 1,
    });
  };

  describe('Продажа товара', () => {
    it('должен успешно продать товар в магазине', () => {
      const product = createProductUnit();
      product.sell(1500, 1);

      expect(product.getPhysicalStatus()).toBe(PhysicalStatus.SOLD);
      expect(product.isReserved()).toBe(false);
    });

    it('должен выбросить ошибку при продаже разобранного товара', () => {
      const product = createProductUnit();
      // Принудительно меняем статус (имитируем разобранное состояние)
      (product as any).props.disassemblyStatus = UnitDisassemblyStatus.DISASSEMBLED;
      
      expect(() => product.sell(1500, 1)).toThrow('Нельзя продать разобранный товар');
    });
  });

  describe('Возврат товара', () => {
    it('должен успешно вернуть проданный товар', () => {
      const product = createProductUnit();
      product.sell(1500, 1);
      product.return(2);

      expect(product.getPhysicalStatus()).toBe(PhysicalStatus.IN_STORE);
    });
  });

  describe('Логирование', () => {
    it('должен создавать лог при продаже', () => {
      const product = createProductUnit();
      product.sell(1500, 1);
      
      const logs = product.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].type).toBe(LogEventType.SALE);
      expect(logs[0].message).toContain('1500');
    });
  });
});

describe('ProductUnit creation', () => {
  it('should create product unit with correct initial status', () => {
    const unit = new ProductUnit({
      uniqueSerialNumber: 'NEW-001',
      purchasePrice: 500,
      isReserved: false,
      createdAt: new Date(),
      status: StatusEnum.RECEIVED,
      physicalStatus: PhysicalStatus.IN_STORE,
      disassemblyStatus: UnitDisassemblyStatus.MONOLITH,
      isReturned: false,
      productId: 1,
    });
    
    expect(unit.getUniqueSerialNumber()).toBe('NEW-001');
    expect(unit.getPhysicalStatus()).toBe(PhysicalStatus.IN_STORE);
    expect(unit.isReserved()).toBe(false);
  });
});
