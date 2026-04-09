import "dotenv/config";
import { prisma } from "../src/config/db";
import { InstitutionService } from "../src/services/InstitutionService";
import { BookingService } from "../src/services/BookingService";
import { DomainError } from "../src/shared/DomainError";

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
      role: "STUDENT",
      institutionId: null
    }
  });
}

async function main() {
  console.log("Seeding started...");

  const allUsers: any[] = [];
  const allResources: any[] = [];

  // -------------------------------
  // MULTI-TENANT LOOP
  // -------------------------------
  for (let i = 0; i < 5; i++) {
    const baseUser = await createBaseUser();

    const institution = await institutionService.create(
      `University_${i}`,
      baseUser.id
    );

    console.log(`Created ${institution.name}`);

    // SUPER ADMIN 
    const superAdmin = await prisma.user.findUnique({
      where: { id: baseUser.id }
    });

    if (superAdmin) allUsers.push(superAdmin);

    // -------------------------------
    // USERS
    // -------------------------------
    for (let j = 0; j < 60; j++) {
      const role =
        j < 5 ? "ADMIN" :
        j < 15 ? "FACULTY" :
        "STUDENT";

      const user = await prisma.user.create({
        data: {
          email: randomEmail(role.toLowerCase()),
          passwordHash: "temp_hash",
          role,
          institutionId: institution.id
        }
      });

      allUsers.push(user);
    }

    // -------------------------------
    // RESOURCES
    // -------------------------------
    const types = ["CLASSROOM", "LAB", "AUDITORIUM"];

    for (let r = 0; r < 20; r++) {
      const resource = await prisma.resource.create({
        data: {
          name: `Resource_${i}_${r}`,
          type: types[random(0, types.length - 1)]!,
          capacity: random(20, 200),
          institutionId: institution.id
        }
      });

      allResources.push(resource);
    }
  }

  console.log("Users & Resources created");

  // -------------------------------
  // BOOKINGS 
  // -------------------------------
  const students = allUsers.filter(u => u.role === "STUDENT");

  let success = 0;
  let failed = 0;

  for (let i = 0; i < 200; i++) {
    const user = students[random(0, students.length - 1)];

    const resources = allResources.filter(
      r => r.institutionId === user.institutionId
    );

    const resource = resources[random(0, resources.length - 1)];

    const { start, end } = futureSlot();

    try {
      const booking = await bookingService.create(
        {
          id: user.id,
          role: user.role,
          institutionId: user.institutionId
        },
        {
          resourceId: resource.id,
          startTime: start,
          endTime: end
        }
      );

      success++;

      // Random lifecycle
      if (Math.random() > 0.5) {
        await bookingService.approve(
          {
            id: user.id,
            role: user.role,
            institutionId: user.institutionId
          },
          booking.id
        );
      } else if (Math.random() > 0.7) {
        await bookingService.reject(
          {
            id: user.id,
            role: user.role,
            institutionId: user.institutionId
          },
          booking.id
        );
      }

    } catch (err) {
      if (err instanceof DomainError) {
        failed++;
      } else {
        throw err;
      }
    }
  }

  console.log(`Bookings → Success: ${success}, Failed (conflicts): ${failed}`);

  console.log("Seeding completed");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });