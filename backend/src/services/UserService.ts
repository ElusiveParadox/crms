import { Prisma, Role, User as PrismaUser } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../config/db";
import { User, UserRole } from "../models/User";
import { UserFactory } from "../patterns/factory/UserFactory";
import { DomainError } from "../shared/DomainError";
import { buildPagination, PaginatedResult } from "../shared/query";
import {
  UserCreateDto,
  UserQueryDto,
  UserUpdateDto,
} from "../validators/user.validator";

type UserListItem = Omit<PrismaUser, "passwordHash">;

export class UserService {
  async register(data: {
    email: string;
    password: string;
    role: string;
    institutionName?: string;
  }) {
    const { email, password, role, institutionName } = data;

    if (!email || !password || !role) {
      throw new DomainError("Missing required fields");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new DomainError("Email already in use", 409);
    }

    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (!emailDomain) {
      throw new DomainError("Invalid email address", 400);
    }

    let institutionId: string | null = null;

    if (institutionName?.trim()) {
      const trimmedName = institutionName.trim();

      if (role === "SUPER_ADMIN") {
        const existingInstitution = await prisma.institution.findFirst({
          where: { name: { equals: trimmedName, mode: "insensitive" }, deletedAt: null },
        });
        if (existingInstitution) {
          throw new DomainError("Institution already exists", 409);
        }
      } else {
        const foundInstitution = await prisma.institution.findFirst({
          where: { name: { equals: trimmedName, mode: "insensitive" }, deletedAt: null },
        });
        if (!foundInstitution) {
          throw new DomainError("Institution not found", 404);
        }
        
        if (foundInstitution.domain && foundInstitution.domain !== emailDomain) {
          throw new DomainError(`Email domain must be @${foundInstitution.domain} to join this institution`, 403);
        }

        institutionId = foundInstitution.id;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    return prisma.$transaction(async (tx) => {
      if (role === "SUPER_ADMIN" && institutionName?.trim()) {
        const institution = await tx.institution.create({
          data: { 
            name: institutionName.trim(),
            domain: emailDomain 
          },
        });

        return tx.user.create({
          data: {
            id: userId,
            email,
            passwordHash,
            role: role as Role,
            institutionId: institution.id,
          },
        });
      }

      return tx.user.create({
        data: {
          id: userId,
          email,
          passwordHash,
          role: role as Role,
          institutionId,
        },
      });
    });
  }

  async login(email: string, password: string) {
    const persistedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!persistedUser) {
      throw new DomainError("Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(password, persistedUser.passwordHash);

    if (!isValid) {
      throw new DomainError("Invalid credentials", 401);
    }

    if (persistedUser.deletedAt) {
      throw new DomainError("User is deactivated", 403);
    }

    return persistedUser;
  }

  async create(actor: User, dto: UserCreateDto): Promise<UserListItem> {
    this.ensureInstitutionScoped(actor);
    this.ensureInstitutionAdmin(actor);

    const existingUser = await prisma.user.findFirst({
      where: {
        email: dto.email,
        deletedAt: null,
      },
    });

    if (existingUser) {
      throw new DomainError("User with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        institutionId: actor.institutionId,
      },
      select: this.userSelect,
    });
  }

  async update(actor: User, id: string, dto: UserUpdateDto): Promise<UserListItem> {
    this.ensureInstitutionScoped(actor);
    this.ensureInstitutionAdmin(actor);

    const existingUser = await this.getUserRecord(actor, id);

    if (dto.email && dto.email !== existingUser.email) {
      const emailConflict = await prisma.user.findFirst({
        where: {
          email: dto.email,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (emailConflict) {
        throw new DomainError("User with this email already exists", 409);
      }
    }

    const data: Prisma.UserUpdateInput = {
      ...(dto.email ? { email: dto.email } : {}),
      ...(dto.role ? { role: dto.role } : {}),
      ...(dto.password
        ? { passwordHash: await bcrypt.hash(dto.password, 10) }
        : {}),
    };

    return prisma.user.update({
      where: { id },
      data,
      select: this.userSelect,
    });
  }

  async delete(actor: User, id: string): Promise<UserListItem> {
    this.ensureInstitutionScoped(actor);
    this.ensureInstitutionAdmin(actor);

    const existingUser = await this.getUserRecord(actor, id);

    if (existingUser.id === actor.id) {
      throw new DomainError("You cannot delete your own account", 400);
    }

    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: this.userSelect,
    });
  }

  async getById(actor: User, id: string): Promise<UserListItem> {
    this.ensureInstitutionScoped(actor);

    return this.getUserRecord(actor, id);
  }

  async getAll(
    actor: User,
    query: UserQueryDto
  ): Promise<PaginatedResult<UserListItem>> {
    this.ensureInstitutionScoped(actor);

    const { page, limit, skip } = buildPagination(query);

    const where: Prisma.UserWhereInput = {
      institutionId: actor.institutionId,
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
      ...(query.email
        ? {
            email: {
              contains: query.email,
              mode: "insensitive",
            },
          }
        : {}),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sort]: query.order,
        },
        select: this.userSelect,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { page, limit, total },
    };
  }

  async updateRole(actor: User, targetUserId: string, newRole: string) {
    return this.update(actor, targetUserId, { role: newRole as Role });
  }

  async softDelete(actor: User, targetUserId: string) {
    return this.delete(actor, targetUserId);
  }

  async getUsersByInstitution(institutionId: string) {
    return prisma.user.findMany({
      where: {
        institutionId,
        deletedAt: null,
      },
      select: this.userSelect,
    });
  }

  private readonly userSelect = {
    id: true,
    email: true,
    role: true,
    institutionId: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.UserSelect;

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

  private async getUserRecord(actor: User, id: string): Promise<UserListItem> {
    const persistedUser = await prisma.user.findFirst({
      where: {
        id,
        institutionId: actor.institutionId,
        deletedAt: null,
      },
      select: this.userSelect,
    });

    if (!persistedUser) {
      throw new DomainError("User not found", 404);
    }

    return persistedUser;
  }
}
