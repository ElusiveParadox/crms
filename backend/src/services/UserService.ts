import { prisma } from "../config/db";
import { UserFactory } from "../patterns/factory/UserFactory";
import { DomainError } from "../shared/DomainError";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

export class UserService {

  // -------------------------------
  // REGISTER USER
  // -------------------------------
  async register(data: {
    email: string;
    password: string;
    role: string;
    institutionId?: string;
  }) {
    const { email, password, role, institutionId } = data;

    if (!email || !password || !role) {
      throw new DomainError("Missing required fields");
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      throw new DomainError("Email already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Domain creation via factory
    const domainUser = UserFactory.create({
      id: crypto.randomUUID(),
      email,
      role,
      institutionId
    } as any);

    const user = await prisma.user.create({
      data: {
        id: domainUser.id,
        email,
        passwordHash,
        role: role as Role,
        institutionId: institutionId ?? null
      }
    });

    return user;
  }

  // -------------------------------
  // LOGIN
  // -------------------------------
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new DomainError("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new DomainError("Invalid credentials");
    }

    if (user.deletedAt) {
      throw new DomainError("User is deactivated");
    }

    return user;
  }

  // -------------------------------
  // UPDATE ROLE
  // -------------------------------
  async updateRole(
    actor: any,
    targetUserId: string,
    newRole: string
  ) {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!target) {
      throw new DomainError("User not found");
    }

    if (actor.institutionId !== target.institutionId) {
      throw new DomainError("Cross-institution access denied");
    }

    const actorDomain = UserFactory.create(actor);

    if (!actorDomain.canOverrideConflicts()) {
      throw new DomainError("Permission denied");
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole as Role }
    });
  }

  // -------------------------------
  // SOFT DELETE
  // -------------------------------
  async softDelete(actor: any, targetUserId: string) {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!target) {
      throw new DomainError("User not found");
    }

    if (actor.institutionId !== target.institutionId) {
      throw new DomainError("Cross-institution access denied");
    }

    const actorDomain = UserFactory.create(actor);

    if (!actorDomain.canOverrideConflicts()) {
      throw new DomainError("Permission denied");
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: { deletedAt: new Date() }
    });
  }

  // -------------------------------
  // GET USERS (Institution scoped)
  // -------------------------------
  async getUsersByInstitution(institutionId: string) {
    return prisma.user.findMany({
      where: {
        institutionId,
        deletedAt: null
      }
    });
  }
}