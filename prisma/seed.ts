import prisma from "../src/config/database";

async function main() {
  const categories = [
    { name: "Rice" },
    { name: "Swallow" },
    { name: "Meshai" },
    { name: "Drinks" },
    { name: "noodles" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log("✅ Categories seeded");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
