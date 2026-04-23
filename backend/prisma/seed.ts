import "dotenv/config";
import { Role, User as PrismaUser, Resource as PrismaResource } from "@prisma/client";
import { prisma } from "../src/config/db";
import { BookingService } from "../src/services/BookingService";
import { InstitutionService } from "../src/services/InstitutionService";
import { UserFactory } from "../src/patterns/factory/UserFactory";
import { DomainError } from "../src/shared/DomainError";
import { UserRole } from "../src/models/User";

const institutionService = new InstitutionService();
const bookingService = new BookingService();

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomEmail = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).substring(2, 8)}@test.com`;

const futureSlot = () => {
  const start = new Date(Date.now() + random(1, 72) * 3600000);
  const end = new Date(start.getTime() + random(1, 3) * 3600000);
  return { start, end };
};

async function createBaseUser() {
  return prisma.user.create({
    data: {
      email: randomEmail("owner"),
      passwordHash: "temp_hash",
      role: Role.STUDENT,
      institutionId: null,
    },
  });
}

async function main() {
  console.log("Seeding started...");

  const allUsers: PrismaUser[] = [];
  const allResources: PrismaResource[] = [];

  for (let i = 0; i < 5; i++) {
    const baseUser = await createBaseUser();

    const institution = await institutionService.create(
      UserFactory.create({
        id: baseUser.id,
        email: baseUser.email,
        role: baseUser.role as unknown as UserRole,
        institutionId: baseUser.institutionId,
      }),
      {
        name: `University_${i}`,
      }
    );

    console.log(`Created ${institution.name}`);

    const superAdmin = await prisma.user.findUnique({
      where: { id: baseUser.id },
    });

    if (superAdmin) {
      allUsers.push(superAdmin);
    }

    for (let j = 0; j < 60; j++) {
      const role = j < 5 ? Role.ADMIN : j < 15 ? Role.FACULTY : Role.STUDENT;

      const user = await prisma.user.create({
        data: {
          email: randomEmail(role.toLowerCase()),
          passwordHash: "temp_hash",
          role,
          institutionId: institution.id,
        },
      });

      allUsers.push(user);
    }

    const types = ["CLASSROOM", "LAB", "AUDITORIUM"];

    for (let r = 0; r < 20; r++) {
      const resource = await prisma.resource.create({
        data: {
          name: `Resource_${i}_${r}`,
          type: types[random(0, types.length - 1)]!,
          capacity: random(20, 200),
          institutionId: institution.id,
        },
      });

      allResources.push(resource);
    }
  }

  console.log("Users & Resources created");

  const students = allUsers.filter((user) => user.role === Role.STUDENT);
  const admins = allUsers.filter(
    (user) => user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN
  );

  let success = 0;
  let failed = 0;

  for (let i = 0; i < 200; i++) {
    const bookingUser = students[random(0, students.length - 1)];

    if (!bookingUser) {
      continue;
    }

    const resources = allResources.filter(
      (resource) => resource.institutionId === bookingUser.institutionId
    );
    const resource = resources[random(0, resources.length - 1)];

    if (!resource) {
      continue;
    }

    const institutionAdmin = admins.find(
      (admin) => admin.institutionId === bookingUser.institutionId
    );
    const { start, end } = futureSlot();

    try {
      const booking = await bookingService.create(
        UserFactory.create({
          id: bookingUser.id,
          email: bookingUser.email,
          role: bookingUser.role as unknown as UserRole,
          institutionId: bookingUser.institutionId,
        }),
        {
          resourceId: resource.id,
          startTime: start,
          endTime: end,
        }
      );

      success++;

      if (institutionAdmin && Math.random() > 0.5) {
        const adminActor = UserFactory.create({
          id: institutionAdmin.id,
          email: institutionAdmin.email,
          role: institutionAdmin.role as unknown as UserRole,
          institutionId: institutionAdmin.institutionId,
        });

        if (Math.random() > 0.7) {
          await bookingService.reject(adminActor, booking.id);
        } else {
          await bookingService.approve(adminActor, booking.id);
        }
      }
    } catch (error) {
      if (error instanceof DomainError) {
        failed++;
      } else {
        throw error;
      }
    }
  }

  console.log(`Bookings → Success: ${success}, Failed (conflicts): ${failed}`);
  console.log("Seeding completed");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
