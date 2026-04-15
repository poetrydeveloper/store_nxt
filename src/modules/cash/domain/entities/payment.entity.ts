export interface PaymentProps {
  id?: number;
  amount: number;
  paymentDate: Date;
  method: 'CASH' | 'CARD' | 'TRANSFER';
  status: string;
  notes?: string;
  customerId: number;
  orderId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Payment {
  private props: PaymentProps;

  constructor(props: PaymentProps) {
    this.props = props;
  }

  getId(): number | undefined { return this.props.id; }
  getAmount(): number { return this.props.amount; }
  getPaymentDate(): Date { return this.props.paymentDate; }
  getMethod(): string { return this.props.method; }
  getStatus(): string { return this.props.status; }
  getNotes(): string | undefined { return this.props.notes; }
  getCustomerId(): number { return this.props.customerId; }
  getOrderId(): number | undefined { return this.props.orderId; }

  updateStatus(status: string): void {
    this.props.status = status;
  }

  toJSON(): PaymentProps {
    return { ...this.props };
  }
}
