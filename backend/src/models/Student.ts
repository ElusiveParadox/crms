import { User, UserRole } from "./User";

export class Student extends User {
  constructor(props: {
    id: string;
    email: string;
    institutionId?: string | null;
  }) {
    super({ ...props, role: UserRole.STUDENT });
  }

  override canCreateBooking(): boolean {
    return true;
  }
}