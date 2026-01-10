import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AppError } from "../utils/appError";
import { getAllMenusService } from "../services/student-service";


export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return next(new AppError("Student not authenticated", 401));
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!student) {
      return next(new AppError("Student not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { student },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return next(new AppError("Student not authenticated", 401));
    }

    const { name, phone } = req.body;

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { name, phone },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: { student: updatedStudent },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMenus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const menus = await getAllMenusService();

    res.status(200).json({
      status: "success",
      results: menus.length,
      data: {
        menus,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getVendorMenus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = Number(req.params.vendorId);
    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : undefined;

    const menus = await prisma.menuItem.findMany({
      where: {
        vendorId,
        available: true,
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
      },
    });

    res.status(200).json({
      status: "success",
      results: menus.length,
      data: {
        menus,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getMenuById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const menuId = Number(req.params.menuId);

    const menu = await prisma.menuItem.findUnique({
      where: { id: menuId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        category: true,
      },
    });

    if (!menu || !menu.available) {
      return next(new AppError("Menu item not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        menu,
      },
    });
  } catch (error) {
    next(error);
  }
};

import { getRecommendedMenus } from "../services/recommendation-service";

export const getRecommendations = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const menus = await getRecommendedMenus(req.user!.id);

    res.status(200).json({
      status: "success",
      results: menus.length,
      data: { menus },
    });
  } catch (err) {
    next(err);
  }
};


