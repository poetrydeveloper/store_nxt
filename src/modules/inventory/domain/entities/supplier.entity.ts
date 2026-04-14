// src/modules/inventory/domain/entities/supplier.entity.ts

export interface SupplierProps {
  id?: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Supplier {
  private props: SupplierProps;

  constructor(props: SupplierProps) {
    this.props = props;
  }

  getId(): number | undefined { return this.props.id; }
  getName(): string { return this.props.name; }
  getContactPerson(): string | undefined { return this.props.contactPerson; }
  getPhone(): string | undefined { return this.props.phone; }
  getEmail(): string | undefined { return this.props.email; }
  getAddress(): string | undefined { return this.props.address; }

  updateName(name: string): void {
    this.props.name = name;
  }

  toJSON(): SupplierProps {
    return { ...this.props };
  }
}
