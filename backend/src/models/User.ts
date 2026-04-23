export enum UserRole {
  STUDENT = "STUDENT",
  FACULTY = "FACULTY",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum UserState {
  INVITED = "INVITED",
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  state: UserState;
  institutionId: string | null;

  canCreateBooking(): boolean;
  canApproveBooking(): boolean;
  canOverrideConflicts(): boolean;
}

export abstract class User implements IUser {
  public readonly id: string;
  public readonly email: string;
  public readonly role: UserRole;
  public readonly state: UserState;
  public readonly institutionId: string | null;

  constructor(props: {
    id: string;
    email: string;
    role: UserRole;
    state?: UserState;
    institutionId?: string | null;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.role = props.role;
    this.state = props.state ?? UserState.INVITED;
    this.institutionId = props.institutionId ?? null;
  }

  protected ensureActive() {
    if (this.state !== UserState.ACTIVE) {
      throw new Error("User is not active");
    }
  }

  canCreateBooking(): boolean {
    return false;
  }

  canApproveBooking(): boolean {
    return false;
  }

  canOverrideConflicts(): boolean {
    return false;
  }
}