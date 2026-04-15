import { Product } from '../domain/entities/product.entity';

describe('Product', () => {
  it('should create a product', () => {
    const product = new Product({
      categoryId: 1,
      code: 'TEST001',
      name: 'Test Product',
      description: 'Test description',
      mainImage: 'https://example.com/image.jpg',
      galleryImages: ['img1.jpg', 'img2.jpg'],
    });
    
    expect(product.getCode()).toBe('TEST001');
    expect(product.getName()).toBe('Test Product');
    expect(product.getDescription()).toBe('Test description');
    expect(product.getMainImage()).toBe('https://example.com/image.jpg');
    expect(product.getGalleryImages()).toHaveLength(2);
  });
  
  it('should add gallery image', () => {
    const product = new Product({
      categoryId: 1,
      code: 'TEST',
      name: 'Test',
      galleryImages: [],
    });
    
    product.addGalleryImage('new.jpg');
    expect(product.getGalleryImages()).toContain('new.jpg');
  });
  
  it('should remove gallery image', () => {
    const product = new Product({
      categoryId: 1,
      code: 'TEST',
      name: 'Test',
      galleryImages: ['img1.jpg', 'img2.jpg'],
    });
    
    product.removeGalleryImage(0);
    expect(product.getGalleryImages()).toHaveLength(1);
    expect(product.getGalleryImages()[0]).toBe('img2.jpg');
  });
  
  it('should update main image', () => {
    const product = new Product({
      categoryId: 1,
      code: 'TEST',
      name: 'Test',
      mainImage: 'old.jpg',
    });
    
    product.updateMainImage('new.jpg');
    expect(product.getMainImage()).toBe('new.jpg');
  });
  
  it('should update name', () => {
    const product = new Product({
      categoryId: 1,
      code: 'TEST',
      name: 'Old Name',
      galleryImages: [],
    });
    
    product.updateName('New Name');
    expect(product.getName()).toBe('New Name');
  });
});
