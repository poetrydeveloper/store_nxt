import { DebtTracking } from '../domain/entities/debt-tracking.entity';

describe('DebtTracking', () => {
  it('should create debt tracking', () => {
    const debt = new DebtTracking({
      totalOwed: 1000,
      totalPaid: 300,
      currentDebt: 700,
      customerId: 1,
    });

    expect(debt.getTotalOwed()).toBe(1000);
    expect(debt.getTotalPaid()).toBe(300);
    expect(debt.getCurrentDebt()).toBe(700);
  });

  it('should remind customer', () => {
    const debt = new DebtTracking({
      totalOwed: 1000,
      totalPaid: 200,
      currentDebt: 800,
      customerId: 1,
    });

    const message = debt.remindCustomer();
    expect(message).toContain('800');
  });

  it('should mark as bad debt', () => {
    const debt = new DebtTracking({
      totalOwed: 500,
      totalPaid: 0,
      currentDebt: 500,
      customerId: 1,
    });

    debt.markAsBadDebt();
    expect(debt.isBadDebt()).toBe(true);
  });
});
