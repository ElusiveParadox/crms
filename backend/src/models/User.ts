export enum UserRole {
  STUDENT = "STUDENT",
  FACULTY = "FACULTY",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface IUser {
  id: string;
  email: string;
  role: UserRole;

  canCreateBooking(): boolean;
  canApproveBooking(): boolean;
  canOverrideConflicts(): boolean;
}

export abstract class User implements IUser {
  public readonly id: string;
  public readonly email: string;
  public readonly role: UserRole;
  public readonly institutionId: string | undefined;

  constructor(props: { id: string; email: string; role: UserRole; institutionId?: string }) {
    this.id = props.id;
    this.email = props.email;
    this.role = props.role;
    this.institutionId = props.institutionId;
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