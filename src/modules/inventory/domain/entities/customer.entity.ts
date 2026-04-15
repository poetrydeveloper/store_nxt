export interface CustomerProps {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer {
  private props: CustomerProps;

  constructor(props: CustomerProps) {
    this.props = props;
  }

  getId(): number | undefined { return this.props.id; }
  getName(): string { return this.props.name; }
  getPhone(): string | undefined { return this.props.phone; }
  getEmail(): string | undefined { return this.props.email; }
  getAddress(): string | undefined { return this.props.address; }
  getBalance(): number { return this.props.balance; }

  addPayment(amount: number): void {
    this.props.balance += amount;
  }

  addDebt(amount: number): void {
    this.props.balance -= amount;
  }

  updateName(name: string): void {
    this.props.name = name;
  }

  toJSON(): CustomerProps {
    return { ...this.props };
  }
}
