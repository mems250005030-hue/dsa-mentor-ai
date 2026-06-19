import { isCatalogEmpty, seedCatalog } from "@/lib/catalog-seed";
import { prisma } from "@/lib/prisma";

let seedPromise: Promise<void> | null = null;

export async function ensureCatalogSeeded() {
  if (!(await isCatalogEmpty(prisma))) {
    return;
  }

  seedPromise ??= seedCatalog(prisma).then(() => undefined);
  await seedPromise;
}
