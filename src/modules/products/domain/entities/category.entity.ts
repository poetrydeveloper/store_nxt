// src/modules/products/domain/entities/category.entity.ts

export interface CategoryProps {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  level: number;
  parentId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category {
  private props: CategoryProps;
  private children: Category[] = [];
  private parent?: Category;

  constructor(props: CategoryProps) {
    this.props = props;
  }

  // Геттеры
  getId(): number | undefined { return this.props.id; }
  getName(): string { return this.props.name; }
  getSlug(): string { return this.props.slug; }
  getDescription(): string | undefined { return this.props.description; }
  getImage(): string | undefined { return this.props.image; }
  getLevel(): number { return this.props.level; }
  getParentId(): number | undefined { return this.props.parentId; }

  // Методы из диаграммы
  getFullPath(): string {
    if (this.parent) {
      return `${this.parent.getFullPath()} → ${this.props.name}`;
    }
    return this.props.name;
  }

  getChildren(): Category[] {
    return [...this.children];
  }

  getParent(): Category | undefined {
    return this.parent;
  }

  getAllProducts() {
    // TODO: будет реализовано после создания Product репозитория
    return [];
  }

  // Вспомогательные методы
  setChildren(children: Category[]): void {
    this.children = children;
  }

  setParent(parent: Category): void {
    this.parent = parent;
  }

  updateName(name: string): void {
    this.props.name = name;
  }

  updateDescription(description: string): void {
    this.props.description = description;
  }

  toJSON(): CategoryProps {
    return { ...this.props };
  }
}
