import prisma from "../config/database";

export const getRecommendedMenus = async (studentId: number) => {
  // 1. Get all past orders of the student with ordered menu items & categories
  const orders = await prisma.order.findMany({
    where: { studentId },
    include: {
      orderItems: {
        include: { menuItem: { include: { category: true } } },
      },
    },
  });

  // 2. Build frequency maps for categories and vendors
  const categoryCount: Record<string, number> = {};
  const vendorCount: Record<number, number> = {};

  orders.forEach((order) => {
    vendorCount[order.vendorId] = (vendorCount[order.vendorId] || 0) + 1;

    order.orderItems.forEach((item) => {
      const categoryName = item.menuItem.category.name;
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });
  });

  // 3. Fetch all available menus with category info
  const menus = await prisma.menuItem.findMany({
    where: { available: true },
    include: { category: true },
  });

  // 4. Score each menu based on matching categories and vendors
  const scoredMenus = menus.map((menu) => {
    let score = 0;

    if (categoryCount[menu.category.name]) score += 3;
    if (vendorCount[menu.vendorId]) score += 2;

    return { menu, score };
  });

  // 5. Sort by score descending and return top 10 menus
  const recommendedMenus = scoredMenus
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((item) => item.menu);

  return recommendedMenus;
};
