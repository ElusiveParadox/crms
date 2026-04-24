import { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/db";
import { User } from "../models/User";
import { DomainError } from "../shared/DomainError";
import { buildPagination, PaginatedResult } from "../shared/query";
import {
  InstitutionCreateDto,
  InstitutionQueryDto,
  InstitutionUpdateDto,
} from "../validators/institution.validator";

type InstitutionRecord = {
  id: string;
  name: string;
  domain: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class InstitutionService {
  async create(actor: User, dto: InstitutionCreateDto): Promise<InstitutionRecord> {
    if (actor.institutionId) {
      throw new DomainError("User already belongs to an institution", 400);
    }

    const existingInstitution = await prisma.institution.findFirst({
      where: {
        name: {
          equals: dto.name,
          mode: "insensitive",
        },
        deletedAt: null,
      },
    });

    if (existingInstitution) {
      throw new DomainError("Institution already exists", 409);
    }

    return prisma.$transaction(async (tx) => {
      const institution = await tx.institution.create({
        data: {
          name: dto.name,
          domain: dto.domain ?? null,
        },
      });

      await tx.user.update({
        where: { id: actor.id },
        data: {
          institutionId: institution.id,
          role: Role.SUPER_ADMIN,
        },
      });

      return institution;
    });
  }

  async update(
    actor: User,
    id: string,
    dto: InstitutionUpdateDto
  ): Promise<InstitutionRecord> {
    this.ensureInstitutionScoped(actor);
    this.ensureInstitutionAdmin(actor);
    this.ensureInstitutionAccess(actor, id);

    if (dto.name) {
      const existingInstitution = await prisma.institution.findFirst({
        where: {
          id: { not: id },
          name: {
            equals: dto.name,
            mode: "insensitive",
          },
          deletedAt: null,
        },
      });

      if (existingInstitution) {
        throw new DomainError("Institution already exists", 409);
      }
    }

    return prisma.institution.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.domain !== undefined ? { domain: dto.domain } : {}),
      },
    });
  }

  async delete(actor: User, id: string): Promise<InstitutionRecord> {
    this.ensureInstitutionScoped(actor);
    this.ensureInstitutionAdmin(actor);
    this.ensureInstitutionAccess(actor, id);

    return prisma.$transaction(async (tx) => {
      const deletedAt = new Date();

      const institution = await tx.institution.update({
        where: { id },
        data: { deletedAt },
      });

      await tx.user.updateMany({
        where: {
          institutionId: id,
          deletedAt: null,
        },
        data: { deletedAt },
      });

      await tx.resource.updateMany({
        where: {
          institutionId: id,
          deletedAt: null,
        },
        data: { deletedAt },
      });

      await tx.booking.updateMany({
        where: {
          deletedAt: null,
          resource: {
            institutionId: id,
            deletedAt: null,
          },
        },
        data: { deletedAt },
      });

      return institution;
    });
  }

  async getById(actor: User, id: string): Promise<InstitutionRecord> {
    this.ensureInstitutionScoped(actor);
    this.ensureInstitutionAccess(actor, id);

    const institution = await prisma.institution.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!institution) {
      throw new DomainError("Institution not found", 404);
    }

    return institution;
  }

  async getAll(
    actor: User,
    query: InstitutionQueryDto
  ): Promise<PaginatedResult<InstitutionRecord>> {
    this.ensureInstitutionScoped(actor);

    const { page, limit, skip } = buildPagination(query);

    const where: Prisma.InstitutionWhereInput = {
      id: actor.institutionId,
      deletedAt: null,
      ...(query.name
        ? {
            name: {
              contains: query.name,
              mode: "insensitive",
            },
          }
        : {}),
    };

    const [institutions, total] = await prisma.$transaction([
      prisma.institution.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sort]: query.order,
        },
      }),
      prisma.institution.count({ where }),
    ]);

    return {
      data: institutions,
      meta: { page, limit, total },
    };
  }

  async search(query: string) {
    if (!query) {
      return [];
    }

    return prisma.institution.findMany({
      where: {
        deletedAt: null,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 10,
    });
  }

  async joinInstitution(userId: string, institutionId: string) {
    const institution = await prisma.institution.findFirst({
      where: {
        id: institutionId,
        deletedAt: null,
      },
    });

    if (!institution) {
      throw new DomainError("Institution not found", 404);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new DomainError("User not found", 404);
    }

    if (user.institutionId) {
      throw new DomainError("User already belongs to an institution", 400);
    }

    const emailDomain = user.email.split("@")[1]?.toLowerCase();
    if (institution.domain && institution.domain !== emailDomain) {
      throw new DomainError(`Email domain must be @${institution.domain} to join this institution`, 403);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        institutionId,
        role: Role.STUDENT,
      },
    });

    return { joined: true };
  }

  private ensureInstitutionScoped(actor: User): asserts actor is User & {
    institutionId: string;
  } {
    if (!actor.institutionId) {
      throw new DomainError("Institution context is required", 400);
    }
  }

  private ensureInstitutionAdmin(actor: User) {
    if (!actor.canOverrideConflicts()) {
      throw new DomainError("Forbidden", 403);
    }
  }

  private ensureInstitutionAccess(actor: User, institutionId: string) {
    if (actor.institutionId !== institutionId) {
      throw new DomainError("Institution not found", 404);
    }
  }
}
