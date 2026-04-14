// src/modules/products/infrastructure/prisma/category.repository.ts

import prisma from '@/modules/shared/database/prisma.service';
import { Category } from '../../domain/entities/category.entity';

export class CategoryRepository {
  async save(category: Category): Promise<Category> {
    const data = category.toJSON();
    
    const saved = await prisma.category.upsert({
      where: { id: data.id || 0 },
      update: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        level: data.level,
        parentId: data.parentId,
      },
      create: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        level: data.level,
        parentId: data.parentId,
      },
    });
    
    return new Category({
      id: saved.id,
      name: saved.name,
      slug: saved.slug,
      description: saved.description || undefined,
      image: saved.image || undefined,
      level: saved.level,
      parentId: saved.parentId || undefined,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  }

  async findById(id: number): Promise<Category | null> {
    const data = await prisma.category.findUnique({
      where: { id },
    });
    
    if (!data) return null;
    
    return new Category({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      image: data.image || undefined,
      level: data.level,
      parentId: data.parentId || undefined,
    });
  }

  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      orderBy: { level: 'asc' },
    });
    
    return categories.map(data => new Category({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      image: data.image || undefined,
      level: data.level,
      parentId: data.parentId || undefined,
    }));
  }

  async getTree(): Promise<Category[]> {
    const categories = await this.findAll();
    const categoryMap = new Map<number, Category>();
    const roots: Category[] = [];

    // Создаём карту категорий
    categories.forEach(cat => {
      categoryMap.set(cat.getId()!, cat);
    });

    // Строим дерево
    categories.forEach(cat => {
      const parentId = cat.getParentId();
      if (parentId && categoryMap.has(parentId)) {
        const parent = categoryMap.get(parentId)!;
        parent.setChildren([...parent.getChildren(), cat]);
        cat.setParent(parent);
      } else {
        roots.push(cat);
      }
    });

    return roots;
  }

  async update(id: number, data: Partial<{ name: string; slug: string; description: string; image: string; level: number; parentId: number }>): Promise<Category> {
    const updated = await prisma.category.update({
      where: { id },
      data,
    });
    
    return new Category({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description || undefined,
      image: updated.image || undefined,
      level: updated.level,
      parentId: updated.parentId || undefined,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}
