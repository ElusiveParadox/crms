import { prisma } from "../config/db";
import { DomainError } from "../shared/DomainError";
import { ensureInstitutionActive } from "../shared/guards/InstitutionGuard";

export async function createResource(user: any, data: any) {
  if (user.institutionId) {
    await ensureInstitutionActive(user.institutionId);
  }

  return prisma.resource.create({
    data: {
      name: data.name,
      type: data.type,
      capacity: data.capacity,
      institutionId: user.institutionId || null
    }
  });
}

export async function listResources(institutionId: string | null | undefined) {
  if (!institutionId) {
    // If the user hasn't joined an institution, let them see all global resources
    return prisma.resource.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });
  }

  return prisma.resource.findMany({
    where: { institutionId, isActive: true },
    orderBy: { name: "asc" }
  });
}