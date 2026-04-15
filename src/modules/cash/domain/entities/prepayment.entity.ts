export interface PrepaymentProps {
  id?: number;
  amount: number;
  deadline: Date;
  remainingDebt: number;
  isFullyPaid: boolean;
  orderId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Prepayment {
  private props: PrepaymentProps;

  constructor(props: PrepaymentProps) {
    this.props = props;
  }

  getId(): number | undefined { return this.props.id; }
  getAmount(): number { return this.props.amount; }
  getDeadline(): Date { return this.props.deadline; }
  getRemainingDebt(): number { return this.props.remainingDebt; }
  isFullyPaid(): boolean { return this.props.isFullyPaid; }
  getOrderId(): number { return this.props.orderId; }

  markAsFullyPaid(): void {
    this.props.isFullyPaid = true;
    this.props.remainingDebt = 0;
  }

  updateRemainingDebt(remainingDebt: number): void {
    this.props.remainingDebt = remainingDebt;
    if (remainingDebt <= 0) {
      this.markAsFullyPaid();
    }
  }

  toJSON(): PrepaymentProps {
    return { ...this.props };
  }
}
