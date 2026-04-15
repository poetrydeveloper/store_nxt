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
});
