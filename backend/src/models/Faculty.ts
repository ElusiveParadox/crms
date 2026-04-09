import { User, UserRole } from "./User";

export class Faculty extends User {
  constructor(props: {
    id: string;
    email: string;
    institutionId?: string | null;
  }) {
    super({ ...props, role: UserRole.FACULTY });
  }

  override canCreateBooking(): boolean {
    return true;
  }

  override canOverrideConflicts(): boolean {
    return true;
  }
}