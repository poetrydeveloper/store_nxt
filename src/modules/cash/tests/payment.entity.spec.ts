import { Payment } from '../domain/entities/payment.entity';

describe('Payment', () => {
  it('should create a payment', () => {
    const payment = new Payment({
      amount: 500,
      paymentDate: new Date(),
      method: 'CASH',
      status: 'COMPLETED',
      notes: 'Предоплата',
      customerId: 1,
    });

    expect(payment.getAmount()).toBe(500);
    expect(payment.getMethod()).toBe('CASH');
    expect(payment.getStatus()).toBe('COMPLETED');
    expect(payment.getNotes()).toBe('Предоплата');
  });

  it('should update status', () => {
    const payment = new Payment({
      amount: 100,
      paymentDate: new Date(),
      method: 'CARD',
      status: 'PENDING',
      customerId: 1,
    });

    payment.updateStatus('COMPLETED');
    expect(payment.getStatus()).toBe('COMPLETED');
  });
});
