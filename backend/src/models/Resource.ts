import { DomainError } from "../shared/DomainError";

type ResourceProps = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  institutionId: string | null;
  isActive?: boolean;
};

export class Resource {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public readonly capacity: number;
  public readonly institutionId: string | null;
  private isActive: boolean;

  constructor(props: ResourceProps) {
    if (!props.id || !props.name || !props.type) {
      throw new DomainError("Invalid resource data");
    }

    if (props.capacity <= 0) {
      throw new DomainError("Resource capacity must be greater than zero");
    }

    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.capacity = props.capacity;
    this.institutionId = props.institutionId;
    this.isActive = props.isActive ?? true;
  }

  // ---------------- STATE ----------------

  deactivate(): void {
    if (!this.isActive) {
      throw new DomainError("Resource already inactive");
    }

    this.isActive = false;
  }

  activate(): void {
    if (this.isActive) {
      throw new DomainError("Resource already active");
    }

    this.isActive = true;
  }

  isAvailable(): boolean {
    return this.isActive;
  }

  // ---------------- BUSINESS RULES ----------------

  validateCapacity(requested: number): void {
    if (requested > this.capacity) {
      throw new DomainError("Requested capacity exceeds resource limit");
    }
  }
}