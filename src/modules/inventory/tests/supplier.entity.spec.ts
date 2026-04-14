import { Supplier } from '../domain/entities/supplier.entity';

describe('Supplier', () => {
  it('should create a supplier', () => {
    const supplier = new Supplier({
      name: 'Test Supplier',
      contactPerson: 'John Doe',
      phone: '+123456789',
      email: 'john@example.com',
      address: '123 Test St',
    });
    
    expect(supplier.getName()).toBe('Test Supplier');
    expect(supplier.getContactPerson()).toBe('John Doe');
    expect(supplier.getPhone()).toBe('+123456789');
    expect(supplier.getEmail()).toBe('john@example.com');
    expect(supplier.getAddress()).toBe('123 Test St');
  });
  
  it('should update name', () => {
    const supplier = new Supplier({ name: 'Old Name' });
    supplier.updateName('New Name');
    expect(supplier.getName()).toBe('New Name');
  });
});
