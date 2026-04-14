// src/modules/inventory/domain/entities/product-unit.entity.ts

export enum StatusEnum {
  CANDIDATE = 'CANDIDATE',
  IN_REQUEST = 'IN_REQUEST',
  IN_DELIVERY = 'IN_DELIVERY',
  RECEIVED = 'RECEIVED',
  SHORTAGE_CONFIRMED = 'SHORTAGE_CONFIRMED',
  SURPLUS_CONFIRMED = 'SURPLUS_CONFIRMED',
}

export enum PhysicalStatus {
  IN_STORE = 'IN_STORE',
  SOLD = 'SOLD',
  LOST = 'LOST',
  IN_DISASSEMBLED = 'IN_DISASSEMBLED',
  IN_COLLECTED = 'IN_COLLECTED',
  ABSORBED = 'ABSORBED',
}

export enum UnitDisassemblyStatus {
  MONOLITH = 'MONOLITH',
  DISASSEMBLED = 'DISASSEMBLED',
  PARTIAL = 'PARTIAL',
  COLLECTED = 'COLLECTED',
  RESTORED = 'RESTORED',
}

export enum LogEventType {
  STATUS_CHANGE = 'STATUS_CHANGE',
  PHYSICAL_STATUS_CHANGE = 'PHYSICAL_STATUS_CHANGE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  DISASSEMBLE = 'DISASSEMBLE',
  COLLECT = 'COLLECT',
  LOST = 'LOST',
}

export interface ProductUnitProps {
  id?: number;
  uniqueSerialNumber: string;
  purchasePrice?: number;
  isReserved: boolean;
  createdAt: Date;
  status: StatusEnum;
  physicalStatus: PhysicalStatus;
  disassemblyStatus: UnitDisassemblyStatus;
  isReturned: boolean;
  returnedAt?: Date;
  salePrice?: number;
  soldAt?: Date;
  productId: number;
  supplierId?: number;
  customerId?: number;
  orderId?: number;
  manualReceiptId?: number;
  parentProductUnitId?: number;
}

export class ProductUnit {
  private props: ProductUnitProps;
  private logs: Array<{ type: LogEventType; message: string; meta?: any }> = [];

  constructor(props: ProductUnitProps) {
    this.props = props;
  }

  // Геттеры
  getId(): number | undefined { return this.props.id; }
  getUniqueSerialNumber(): string { return this.props.uniqueSerialNumber; }
  getPhysicalStatus(): PhysicalStatus { return this.props.physicalStatus; }
  getDisassemblyStatus(): UnitDisassemblyStatus { return this.props.disassemblyStatus; }
  isReserved(): boolean { return this.props.isReserved; }

  // Продажа товара
  sell(price: number, cashDayId: number): void {
    // Проверка: товар должен быть в магазине
    if (this.props.physicalStatus !== PhysicalStatus.IN_STORE) {
      throw new Error('Нельзя продать товар, которого нет в магазине');
    }

    // Проверка: товар не должен быть разобран
    if (this.props.disassemblyStatus === UnitDisassemblyStatus.DISASSEMBLED) {
      throw new Error('Нельзя продать разобранный товар');
    }

    // Обновляем состояние
    this.props.salePrice = price;
    this.props.soldAt = new Date();
    this.props.physicalStatus = PhysicalStatus.SOLD;
    this.props.isReserved = false;

    // Логируем
    this.log(LogEventType.SALE, `Товар продан за ${price} руб.`, {
      price,
      cashDayId,
      soldAt: this.props.soldAt
    });
  }

  // Возврат товара
  return(cashDayId: number): void {
    if (this.props.physicalStatus !== PhysicalStatus.SOLD) {
      throw new Error('Можно вернуть только проданный товар');
    }

    this.props.isReturned = true;
    this.props.returnedAt = new Date();
    this.props.physicalStatus = PhysicalStatus.IN_STORE;
    this.props.salePrice = undefined;
    this.props.soldAt = undefined;

    this.log(LogEventType.RETURN, `Товар возвращён`, {
      cashDayId,
      returnedAt: this.props.returnedAt
    });
  }

  // Списание товара
  lose(reason: string): void {
    if (this.props.physicalStatus === PhysicalStatus.SOLD) {
      throw new Error('Проданный товар нельзя списать');
    }

    this.props.physicalStatus = PhysicalStatus.LOST;
    this.props.isReserved = true;

    this.log(LogEventType.LOST, `Товар списан: ${reason}`, { reason });
  }

  // Логирование
  private log(type: LogEventType, message: string, meta?: any): void {
    this.logs.push({ type, message, meta });
  }

  getLogs(): Array<{ type: LogEventType; message: string; meta?: any }> {
    return [...this.logs];
  }

  toJSON(): ProductUnitProps {
    return { ...this.props };
  }
}