import { User } from "../models/User";
import { UserRole } from "../models/User";
import { UserFactory } from "../patterns/factory/UserFactory";

type PersistenceUser = {
  id: string;
  email: string;
  role: string;
};

export class UserMapper {
  static toDomain(raw: PersistenceUser): User {
    if (!raw?.id || !raw?.email || !raw?.role) {
      throw new Error("Invalid user persistence model");
    }

    return UserFactory.create({
      id: raw.id,
      email: raw.email,
      role: raw.role as UserRole,
    });
  }

  static toDTO(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}