import { User, UserRole } from "./User";

export class Admin extends User {
  constructor(props: {
    id: string;
    email: string;
    institutionId?: string | null;
  }) {
    super({ ...props, role: UserRole.ADMIN });
  }

  override canCreateBooking(): boolean {
    return true;
  }

  override canApproveBooking(): boolean {
    return true;
  }

  override canOverrideConflicts(): boolean {
    return true;
  }
}