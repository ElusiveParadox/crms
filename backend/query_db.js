const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ include: { institution: true } });
  console.log("Users:", JSON.stringify(users, null, 2));
  const resources = await prisma.resource.findMany();
  console.log("Resources:", JSON.stringify(resources, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
