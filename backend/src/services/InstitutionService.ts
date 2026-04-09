import { prisma } from "../config/db";
import { Institution } from "../models/Institution";
import { InstitutionMapper } from "../mappers/InstitutionMapper";
import { DomainError } from "../shared/DomainError";
import { Role } from "@prisma/client";

export class InstitutionService {
  async search(query: string): Promise<Institution[]> {
    if (!query) return [];

    const institutions = await prisma.institution.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { startsWith: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } }
        ]
      },
      orderBy: [
        { name: "asc" }
      ],
      take: 10
    });

    return institutions.map(InstitutionMapper.toDomain);
  }

  async create(name: string, userId: string): Promise<Institution> {
    const existing = await prisma.institution.findUnique({
      where: { name }
    });

    if (existing) {
      throw new DomainError("Institution already exists");
    }

    const institution = await prisma.institution.create({
      data: { name }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: Role.SUPER_ADMIN,
        institutionId: institution.id
      }
    });

    return InstitutionMapper.toDomain(institution);
  }

  async deleteInstitution(institutionId: string) {
    await prisma.institution.update({
      where: { id: institutionId },
      data: { deletedAt: new Date() }
    });

    // Soft-delete all users in the institution
    await prisma.user.updateMany({
      where: { institutionId },
      data: { deletedAt: new Date() }
    });
  }

  async joinInstitution(userId: string, institutionId: string) {
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId }
    });

    if (!institution || institution.deletedAt) {
      throw new DomainError("Institution not found or inactive");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new DomainError("User not found");
    }

    if (user.institutionId) {
      throw new DomainError("User already belongs to an institution");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        institutionId,
        role: Role.STUDENT
      }
    });

    return { message: "Joined institution successfully" };
  }
}