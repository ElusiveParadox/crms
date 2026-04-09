import { Admin } from "../../models/Admin";
import { Faculty } from "../../models/Faculty";
import { Student } from "../../models/Student";
import { User, UserRole } from "../../models/User";
import { DomainError } from "../../shared/DomainError";

type UserProps = {
  id: string;
  email: string;
  role: UserRole;
  institutionId?: string | null;
};

export class UserFactory {
  static create(props: UserProps): User {
    this.validate(props);

    const normalizedProps = {
      id: props.id,
      email: props.email,
      role: props.role,
      institutionId: props.institutionId ?? null
    };

    switch (normalizedProps.role) {
      case UserRole.STUDENT:
        return new Student(normalizedProps);

      case UserRole.FACULTY:
        return new Faculty(normalizedProps);

      case UserRole.ADMIN:
      case UserRole.SUPER_ADMIN:
        return new Admin(normalizedProps);

      default:
        throw new DomainError(`Invalid role: ${normalizedProps.role}`);
    }
  }

  private static validate(props: UserProps) {
    if (!props.id) {
      throw new DomainError("User id is required");
    }

    if (!props.email) {
      throw new DomainError("User email is required");
    }

    if (!props.role) {
      throw new DomainError("User role is required");
    }

    if (!Object.values(UserRole).includes(props.role)) {
      throw new DomainError(`Invalid role: ${props.role}`);
    }

    if (props.institutionId !== undefined && props.institutionId !== null) {
      if (typeof props.institutionId !== "string") {
        throw new DomainError("Invalid institutionId");
      }

      if (props.institutionId.trim().length === 0) {
        throw new DomainError("institutionId cannot be empty");
      }
    }
  }
}