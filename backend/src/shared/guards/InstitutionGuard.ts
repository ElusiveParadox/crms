import { prisma } from "../../config/db";
import { DomainError } from "../DomainError";

export async function ensureInstitutionActive(institutionId: string | null) {
  if (!institutionId) {
    throw new DomainError("Institution is inactive or not found");
  }

  const inst = await prisma.institution.findUnique({
    where: { id: institutionId }

  });

  if (!inst || inst.deletedAt) {
    throw new DomainError("Institution is inactive");
  }
}