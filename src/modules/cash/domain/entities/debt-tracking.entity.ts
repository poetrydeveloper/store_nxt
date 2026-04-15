export interface DebtTrackingProps {
  id?: number;
  totalOwed: number;
  totalPaid: number;
  currentDebt: number;
  lastReminderSent?: Date;
  customerId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DebtTracking {
  private props: DebtTrackingProps;
  private badDebt: boolean = false;

  constructor(props: DebtTrackingProps) {
    this.props = props;
  }

  getId(): number | undefined { return this.props.id; }
  getTotalOwed(): number { return this.props.totalOwed; }
  getTotalPaid(): number { return this.props.totalPaid; }
  getCurrentDebt(): number { return this.props.currentDebt; }
  getLastReminderSent(): Date | undefined { return this.props.lastReminderSent; }
  getCustomerId(): number { return this.props.customerId; }
  isBadDebt(): boolean { return this.badDebt; }

  remindCustomer(): string {
    this.props.lastReminderSent = new Date();
    return `Напоминание о долге: ${this.props.currentDebt} руб.`;
  }

  markAsBadDebt(): void {
    this.badDebt = true;
  }

  updateDebt(totalOwed: number, totalPaid: number): void {
    this.props.totalOwed = totalOwed;
    this.props.totalPaid = totalPaid;
    this.props.currentDebt = totalOwed - totalPaid;
  }

  toJSON(): DebtTrackingProps {
    return { ...this.props };
  }
}
