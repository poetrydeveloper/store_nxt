import { Order } from '../domain/entities/order.entity';

describe('Order', () => {
  it('should create an order', () => {
    const order = new Order({
      orderNumber: 'ORD-001',
      orderDate: new Date(),
      expectedDeliveryDate: new Date(),
    });

    expect(order.getOrderNumber()).toBe('ORD-001');
  });

  it('should update status', () => {
    const order = new Order({
      orderNumber: 'ORD-002',
      orderDate: new Date(),
      status: 'DRAFT',
    });

    order.updateStatus('SHIPPED');
    expect(order.getStatus()).toBe('SHIPPED');
  });

  it('should update expected delivery date', () => {
    const order = new Order({
      orderNumber: 'ORD-003',
      orderDate: new Date(),
    });

    const newDate = new Date('2026-05-01');
    order.updateExpectedDeliveryDate(newDate);
    expect(order.getExpectedDeliveryDate()).toBe(newDate);
  });
});
