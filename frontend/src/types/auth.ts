export type Role = "STUDENT" | "FACULTY" | "ADMIN" | "SUPER_ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  institutionId: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | string;
  isApproved?: boolean;
};
