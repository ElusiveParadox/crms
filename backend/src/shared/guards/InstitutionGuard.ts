import { prisma } from "../../config/db";
import { DomainError } from "../DomainError";

export async function ensureInstitutionActive(institutionId: string) {
  const inst = await prisma.institution.findUnique({
    where: { id: institutionId }
  });

  if (!inst || inst.deletedAt) {
    throw new DomainError("Institution is inactive");
  }
}