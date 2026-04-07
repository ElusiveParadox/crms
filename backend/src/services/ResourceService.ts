import { prisma } from "../config/db";
import { DomainError } from "../shared/DomainError";
import { ensureInstitutionActive } from "../shared/guards/InstitutionGuard";

export async function createResource(user: any, data: any) {
  await ensureInstitutionActive(user.institutionId);

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new DomainError("Only admin can create resources");
  }

  return prisma.resource.create({
    data: {
      name: data.name,
      type: data.type,
      capacity: data.capacity,
      institutionId: user.institutionId
    }
  });
}