export interface OrderProps {
  id?: number;
  orderNumber: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order {
  private props: OrderProps;

  constructor(props: OrderProps) {
    this.props = props;
  }

  getId(): number | undefined { return this.props.id; }
  getOrderNumber(): string { return this.props.orderNumber; }
  getOrderDate(): Date { return this.props.orderDate; }
  getExpectedDeliveryDate(): Date | undefined { return this.props.expectedDeliveryDate; }
  getStatus(): string | undefined { return this.props.status; }

  updateStatus(status: string): void {
    this.props.status = status;
  }

  updateExpectedDeliveryDate(date: Date): void {
    this.props.expectedDeliveryDate = date;
  }

  toJSON(): OrderProps {
    return { ...this.props };
  }
}
