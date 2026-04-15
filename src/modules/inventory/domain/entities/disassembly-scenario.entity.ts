export interface DisassemblyScenarioProps {
  id?: number;
  name: string;
  parentProductCode: string;
  childProductCodes: string[];
  partsCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DisassemblyScenario {
  private props: DisassemblyScenarioProps;

  constructor(props: DisassemblyScenarioProps) {
    this.props = props;
  }

  getId(): number | undefined { return this.props.id; }
  getName(): string { return this.props.name; }
  getParentProductCode(): string { return this.props.parentProductCode; }
  getChildProductCodes(): string[] { return [...this.props.childProductCodes]; }
  getPartsCount(): number { return this.props.partsCount; }
  isActive(): boolean { return this.props.isActive; }

  activate(): void {
    this.props.isActive = true;
  }

  deactivate(): void {
    this.props.isActive = false;
  }

  validate(productCode: string): boolean {
    return this.props.parentProductCode === productCode;
  }

  toJSON(): DisassemblyScenarioProps {
    return { ...this.props };
  }
}
