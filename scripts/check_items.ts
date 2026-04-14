import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const items = await prisma.catalogItem.findMany({
    where: { category: { not: "pokemon" } },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    select: { category: true, name: true, slug: true, spriteUrl: true },
  });
  console.log(JSON.stringify(items, null, 2));
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
