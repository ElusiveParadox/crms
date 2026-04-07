import { DomainError } from "../shared/DomainError";

type InstitutionProps = {
  id: string;
  name: string;
  domain?: string;
  deletedAt?: Date | null;
};

export class Institution {
  public readonly id: string;
  public readonly name: string;
  public readonly domain?: string | undefined;
  public readonly deletedAt?: Date | null | undefined;

  constructor(props: InstitutionProps) {
    if (!props.name || props.name.trim().length < 3) {
      throw new DomainError("Institution name must be at least 3 characters");
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.domain = props.domain;
    this.deletedAt = props.deletedAt ?? null;
  }

  isActive(): boolean {
    return !this.deletedAt;
  }
}