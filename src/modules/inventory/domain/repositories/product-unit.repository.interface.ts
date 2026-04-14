// src/modules/inventory/domain/repositories/product-unit.repository.interface.ts

import { ProductUnit } from '../entities/product-unit.entity';

export interface IProductUnitRepository {
  save(productUnit: ProductUnit): Promise<void>;
  findBySerial(serialNumber: string): Promise<ProductUnit | null>;
  findById(id: number): Promise<ProductUnit | null>;
  updateLogs(productUnitId: number, logs: any[]): Promise<void>;
}
