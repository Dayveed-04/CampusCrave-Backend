import prisma from "../config/database";


export const getAllMenusService = async () => {
  return prisma.menuItem.findMany({
    where: {
      available: true,
    },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};


