// src/modules/products/tests/category.entity.spec.ts

import { Category } from '../domain/entities/category.entity';

describe('Category', () => {
  it('should create a category', () => {
    const category = new Category({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test description',
      level: 0,
    });
    
    expect(category.getName()).toBe('Test Category');
    expect(category.getSlug()).toBe('test-category');
    expect(category.getDescription()).toBe('Test description');
    expect(category.getLevel()).toBe(0);
  });
  
  it('should get full path with parent', () => {
    const parent = new Category({ name: 'Parent', slug: 'parent', level: 0 });
    const child = new Category({ name: 'Child', slug: 'child', level: 1, parentId: 1 });
    child.setParent(parent);
    
    expect(child.getFullPath()).toBe('Parent → Child');
  });
  
  it('should get full path without parent', () => {
    const category = new Category({ name: 'Root', slug: 'root', level: 0 });
    
    expect(category.getFullPath()).toBe('Root');
  });
  
  it('should get children', () => {
    const parent = new Category({ name: 'Parent', slug: 'parent', level: 0 });
    const child = new Category({ name: 'Child', slug: 'child', level: 1 });
    parent.setChildren([child]);
    
    expect(parent.getChildren()).toHaveLength(1);
    expect(parent.getChildren()[0].getName()).toBe('Child');
  });
  
  it('should get parent', () => {
    const parent = new Category({ name: 'Parent', slug: 'parent', level: 0 });
    const child = new Category({ name: 'Child', slug: 'child', level: 1 });
    child.setParent(parent);
    
    expect(child.getParent()).toBe(parent);
  });
  
  it('should update name', () => {
    const category = new Category({ name: 'Old', slug: 'old', level: 0 });
    category.updateName('New');
    
    expect(category.getName()).toBe('New');
  });
  
  it('should convert to JSON', () => {
    const category = new Category({
      name: 'Test',
      slug: 'test',
      level: 0,
    });
    
    expect(category.toJSON()).toMatchObject({
      name: 'Test',
      slug: 'test',
      level: 0,
    });
  });
});
