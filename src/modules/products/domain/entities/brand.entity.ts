// src/modules/products/domain/entities/brand.entity.ts

export interface BrandProps {
  id?: number;
  name: string;
  logo?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Brand {
  private props: BrandProps;

  constructor(props: BrandProps) {
    this.props = props;
  }

  getId(): number | undefined { return this.props.id; }
  getName(): string { return this.props.name; }
  getLogo(): string | undefined { return this.props.logo; }
  getDescription(): string | undefined { return this.props.description; }

  updateName(name: string): void {
    this.props.name = name;
  }

  updateLogo(logo: string): void {
    this.props.logo = logo;
  }

  updateDescription(description: string): void {
    this.props.description = description;
  }

  toJSON(): BrandProps {
    return { ...this.props };
  }
}
