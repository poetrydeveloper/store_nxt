import { Customer } from '../domain/entities/customer.entity';

describe('Customer', () => {
  it('should create a customer', () => {
    const customer = new Customer({
      name: 'Иван Петров',
      phone: '+79991234567',
      email: 'ivan@example.com',
      address: 'Москва, ул. Тестовая, 1',
      balance: 1000,
    });
    
    expect(customer.getName()).toBe('Иван Петров');
    expect(customer.getPhone()).toBe('+79991234567');
    expect(customer.getEmail()).toBe('ivan@example.com');
    expect(customer.getBalance()).toBe(1000);
  });
  
  it('should add payment (увеличить баланс)', () => {
    const customer = new Customer({ name: 'Test', balance: 500 });
    customer.addPayment(200);
    expect(customer.getBalance()).toBe(700);
  });
  
  it('should add debt (уменьшить баланс)', () => {
    const customer = new Customer({ name: 'Test', balance: 500 });
    customer.addDebt(200);
    expect(customer.getBalance()).toBe(300);
  });
  
  it('should update name', () => {
    const customer = new Customer({ name: 'Old Name', balance: 0 });
    customer.updateName('New Name');
    expect(customer.getName()).toBe('New Name');
  });
});
