import { Brand } from '../domain/entities/brand.entity';

describe('Brand', () => {
  it('should create a brand', () => {
    const brand = new Brand({
      name: 'Test Brand',
      logo: 'https://example.com/logo.png',
      description: 'Test description',
    });
    
    expect(brand.getName()).toBe('Test Brand');
    expect(brand.getLogo()).toBe('https://example.com/logo.png');
    expect(brand.getDescription()).toBe('Test description');
  });
  
  it('should update brand name', () => {
    const brand = new Brand({ name: 'Old Name' });
    brand.updateName('New Name');
    expect(brand.getName()).toBe('New Name');
  });
});
