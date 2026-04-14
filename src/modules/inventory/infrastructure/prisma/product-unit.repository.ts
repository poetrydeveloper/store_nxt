// src/modules/inventory/infrastructure/prisma/product-unit.repository.ts

import { PrismaClient } from '@prisma/client'
import { ProductUnit } from '../../domain/entities/product-unit.entity'

const prisma = new PrismaClient()

export class ProductUnitRepository {
  async save(productUnit: ProductUnit): Promise<void> {
    const data = productUnit.toJSON()
    
    await prisma.productUnit.upsert({
      where: { id: data.id || 0 },
      update: {
        uniqueSerialNumber: data.uniqueSerialNumber,
        purchasePrice: data.purchasePrice,
        isReserved: data.isReserved,
        status: data.status,
        physicalStatus: data.physicalStatus,
        disassemblyStatus: data.disassemblyStatus,
        isReturned: data.isReturned,
        returnedAt: data.returnedAt,
        salePrice: data.salePrice,
        soldAt: data.soldAt,
        productId: data.productId,
        supplierId: data.supplierId,
        customerId: data.customerId,
        orderId: data.orderId,
        manualReceiptId: data.manualReceiptId,
        parentProductUnitId: data.parentProductUnitId,
      },
      create: {
        uniqueSerialNumber: data.uniqueSerialNumber,
        purchasePrice: data.purchasePrice,
        isReserved: data.isReserved,
        status: data.status,
        physicalStatus: data.physicalStatus,
        disassemblyStatus: data.disassemblyStatus,
        isReturned: data.isReturned,
        returnedAt: data.returnedAt,
        salePrice: data.salePrice,
        soldAt: data.soldAt,
        productId: data.productId,
        supplierId: data.supplierId,
        customerId: data.customerId,
        orderId: data.orderId,
        manualReceiptId: data.manualReceiptId,
        parentProductUnitId: data.parentProductUnitId,
      },
    })
  }

  async findBySerial(serialNumber: string): Promise<ProductUnit | null> {
    const data = await prisma.productUnit.findUnique({
      where: { uniqueSerialNumber: serialNumber },
    })
    
    if (!data) return null
    
    return new ProductUnit({
      id: data.id,
      uniqueSerialNumber: data.uniqueSerialNumber,
      purchasePrice: data.purchasePrice || undefined,
      isReserved: data.isReserved,
      createdAt: data.createdAt,
      status: data.status,
      physicalStatus: data.physicalStatus,
      disassemblyStatus: data.disassemblyStatus,
      isReturned: data.isReturned,
      returnedAt: data.returnedAt || undefined,
      salePrice: data.salePrice || undefined,
      soldAt: data.soldAt || undefined,
      productId: data.productId,
      supplierId: data.supplierId || undefined,
      customerId: data.customerId || undefined,
      orderId: data.orderId || undefined,
      manualReceiptId: data.manualReceiptId || undefined,
      parentProductUnitId: data.parentProductUnitId || undefined,
    })
  }

  async findById(id: number): Promise<ProductUnit | null> {
    const data = await prisma.productUnit.findUnique({
      where: { id },
    })
    
    if (!data) return null
    
    return new ProductUnit({
      id: data.id,
      uniqueSerialNumber: data.uniqueSerialNumber,
      purchasePrice: data.purchasePrice || undefined,
      isReserved: data.isReserved,
      createdAt: data.createdAt,
      status: data.status,
      physicalStatus: data.physicalStatus,
      disassemblyStatus: data.disassemblyStatus,
      isReturned: data.isReturned,
      returnedAt: data.returnedAt || undefined,
      salePrice: data.salePrice || undefined,
      soldAt: data.soldAt || undefined,
      productId: data.productId,
      supplierId: data.supplierId || undefined,
      customerId: data.customerId || undefined,
      orderId: data.orderId || undefined,
      manualReceiptId: data.manualReceiptId || undefined,
      parentProductUnitId: data.parentProductUnitId || undefined,
    })
  }

  async updateLogs(productUnitId: number, logs: any[]): Promise<void> {
    for (const log of logs) {
      await prisma.productUnitLog.create({
        data: {
          type: log.type,
          message: log.message,
          meta: log.meta,
          productUnitId: productUnitId,
        },
      })
    }
  }
}
