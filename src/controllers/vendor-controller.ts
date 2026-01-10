import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AppError } from "../utils/appError";

// Get logged-in vendor profile
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, phone: true, location: true, createdAt: true },
    });
    if (!vendor) return next(new AppError("Vendor not found", 404));

    res.json({ status: "success", data: { vendor } });
  } catch (error) {
    next(error);
  }
};

// Update vendor profile
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, location } = req.body;

    const updatedVendor = await prisma.vendor.update({
      where: { id: req.user!.id },
      data: { name, phone, location },
      select: { id: true, email: true, name: true, phone: true, location: true, updatedAt: true },
    });

    res.json({ status: "success", data: { vendor: updatedVendor } });
  } catch (error) {
    next(error);
  }
};

export const createMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, imageUrl, available, categoryId } = req.body;

    if (!name || !price || !categoryId) {
      return next(new AppError("Name, price, and categoryId are required", 400));
    }

    const newMenu = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl,
        available: available === undefined ? true : Boolean(available),
        categoryId: Number(categoryId),
        vendorId: req.user!.id,
      },
    });

    res.status(201).json({ status: "success", data: { menu: newMenu } });
  } catch (error) {
    next(error);
  }
};

// Get all menus for logged-in vendor
export const getMenus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menus = await prisma.menuItem.findMany({
      where: { vendorId: req.user!.id },
      include: { category: true },
    });

    res.json({ status: "success", results: menus.length, data: { menus } });
  } catch (error) {
    next(error);
  }
};

// Get menu by ID (only if it belongs to logged-in vendor)
export const getMenuById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuId = Number(req.params.menuId);
    const menu = await prisma.menuItem.findFirst({
      where: { id: menuId, vendorId: req.user!.id },
      include: { category: true },
    });

    if (!menu) {
      return next(new AppError("Menu item not found", 404));
    }

    res.json({ status: "success", data: { menu } });
  } catch (error) {
    next(error);
  }
};

// Update a menu item (owned by vendor)
export const updateMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuId = Number(req.params.menuId);
    const { name, description, price, imageUrl, available, categoryId } = req.body;

    // Check ownership
    const existingMenu = await prisma.menuItem.findUnique({ where: { id: menuId } });
    if (!existingMenu || existingMenu.vendorId !== req.user!.id) {
      return next(new AppError("Menu item not found or unauthorized", 404));
    }

    const updatedMenu = await prisma.menuItem.update({
      where: { id: menuId },
      data: {
        name,
        description,
        price: price !== undefined ? Number(price) : undefined,
        imageUrl,
        available,
        categoryId: categoryId !== undefined ? Number(categoryId) : undefined,
      },
    });

    res.json({ status: "success", data: { menu: updatedMenu } });
  } catch (error) {
    next(error);
  }
};

// Delete a menu item (owned by vendor)
export const deleteMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuId = Number(req.params.menuId);

    const existingMenu = await prisma.menuItem.findUnique({ where: { id: menuId } });
    if (!existingMenu || existingMenu.vendorId !== req.user!.id) {
      return next(new AppError("Menu item not found or unauthorized", 404));
    }

    await prisma.menuItem.delete({ where: { id: menuId } });

    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    next(error);
  }
};

