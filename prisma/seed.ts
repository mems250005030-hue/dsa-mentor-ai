import { PrismaClient } from "@prisma/client";
import { seedCatalog } from "../src/lib/catalog-seed";

const prisma = new PrismaClient();

async function main() {
  await seedCatalog(prisma, { log: true });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
