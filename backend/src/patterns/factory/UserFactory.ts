import { Admin } from "../../models/Admin";
import { Faculty } from "../../models/Faculty";
import { Student } from "../../models/Student";
import { User, UserRole } from "../../models/User";
import { DomainError } from "../../shared/DomainError";

type UserProps = {
  id: string;
  email: string;
  role: UserRole;
};

export class UserFactory {
  static create(props: UserProps): User {
    switch (props.role) {
      case UserRole.STUDENT:
        return new Student(props);

      case UserRole.FACULTY:
        return new Faculty(props);

      case UserRole.ADMIN:
        return new Admin(props);

      default:
        throw new DomainError(`Invalid role: ${props.role}`);
    }
  }
}