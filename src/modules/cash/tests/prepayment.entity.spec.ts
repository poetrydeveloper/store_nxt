import { Prepayment } from '../domain/entities/prepayment.entity';

describe('Prepayment', () => {
  it('should create a prepayment', () => {
    const prepayment = new Prepayment({
      amount: 500,
      deadline: new Date(),
      remainingDebt: 500,
      isFullyPaid: false,
      orderId: 1,
    });

    expect(prepayment.getAmount()).toBe(500);
    expect(prepayment.getRemainingDebt()).toBe(500);
    expect(prepayment.isFullyPaid()).toBe(false);
  });

  it('should mark as fully paid', () => {
    const prepayment = new Prepayment({
      amount: 500,
      deadline: new Date(),
      remainingDebt: 500,
      isFullyPaid: false,
      orderId: 1,
    });

    prepayment.markAsFullyPaid();
    expect(prepayment.isFullyPaid()).toBe(true);
    expect(prepayment.getRemainingDebt()).toBe(0);
  });

  it('should update remaining debt', () => {
    const prepayment = new Prepayment({
      amount: 1000,
      deadline: new Date(),
      remainingDebt: 1000,
      isFullyPaid: false,
      orderId: 1,
    });

    prepayment.updateRemainingDebt(300);
    expect(prepayment.getRemainingDebt()).toBe(300);
  });
});
