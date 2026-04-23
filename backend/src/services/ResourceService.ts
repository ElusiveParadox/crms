import { Prisma, Resource as PrismaResource } from "@prisma/client";
import { prisma } from "../config/db";
import { User } from "../models/User";
import { DomainError } from "../shared/DomainError";
import { ensureInstitutionActive } from "../shared/guards/InstitutionGuard";
import { buildPagination, PaginatedResult } from "../shared/query";
import {
  ResourceCreateDto,
  ResourceQueryDto,
  ResourceUpdateDto,
} from "../validators/resource.validator";

export class ResourceService {
  async create(actor: User, dto: ResourceCreateDto): Promise<PrismaResource> {
    this.ensureInstitutionScoped(actor);
    this.ensureInstitutionAdmin(actor);
    await ensureInstitutionActive(actor.institutionId);

    return prisma.resource.create({
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description ?? null,
        capacity: dto.capacity,
        isActive: dto.isActive ?? true,
        institutionId: actor.institutionId,
      },
    });
  }

  async update(
    actor: User,
    id: string,
    dto: ResourceUpdateDto
  ): Promise<PrismaResource> {
    this.ensureInstitutionScoped(actor);
    this.ensureInstitutionAdmin(actor);
    await this.getResourceRecord(actor, id);

    return prisma.resource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async delete(actor: User, id: string): Promise<PrismaResource> {
    this.ensureInstitutionScoped(actor);
    this.ensureInstitutionAdmin(actor);
    await this.getResourceRecord(actor, id);

    return prisma.resource.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getById(actor: User, id: string): Promise<PrismaResource> {
    this.ensureInstitutionScoped(actor);

    return this.getResourceRecord(actor, id);
  }

  async getAll(
    actor: User,
    query: ResourceQueryDto
  ): Promise<PaginatedResult<PrismaResource>> {
    this.ensureInstitutionScoped(actor);

    const { page, limit, skip } = buildPagination(query);

    const where: Prisma.ResourceWhereInput = {
      institutionId: actor.institutionId,
      deletedAt: null,
      ...(query.type
        ? {
            type: {
              equals: query.type,
              mode: "insensitive",
            },
          }
        : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };

    const [resources, total] = await prisma.$transaction([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sort]: query.order,
        },
      }),
      prisma.resource.count({ where }),
    ]);

    return {
      data: resources,
      meta: { page, limit, total },
    };
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

  private async getResourceRecord(
    actor: User,
    id: string
  ): Promise<PrismaResource> {
    const resource = await prisma.resource.findFirst({
      where: {
        id,
        institutionId: actor.institutionId,
        deletedAt: null,
      },
    });

    if (!resource) {
      throw new DomainError("Resource not found", 404);
    }

    return resource;
  }
}
