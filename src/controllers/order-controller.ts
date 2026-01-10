import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AppError } from "../utils/appError";
import { CreateOrderItem } from "../types/order-types";


export const createOrder = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const studentId = req.user!.id;
    const { vendorId, items, deliveryLocation,deliveryNotes, } = req.body;

    if (!items || items.length === 0) {
      return next(new AppError("Order must contain at least one item", 400));
    }
    if (!vendorId || !items?.length || !deliveryLocation) {
      return next(new AppError("Missing required order fields", 400));
    }


    let totalAmount = 0;

    const orderItems:CreateOrderItem[]= await Promise.all( 
      items.map(async (item: any) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
        });

        if (!menuItem) {
          throw new AppError("Menu item not found", 404);
        }

        totalAmount += menuItem.price * item.quantity;

        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: menuItem.price,
        };
      })
    );

    const order = await prisma.order.create({
      data: {
        student:{
          connect:{id:req.user!.id}
        },
        vendor:{
          connect:{id:vendorId}
        },
        totalAmount,
        deliveryLocation,
        deliveryNotes,
        orderItems: {
          create: orderItems.map((item: CreateOrderItem) => ({
            quantity: item.quantity,
            unitPrice: item.price,
            menuItem: {
              connect: { id: item.menuItemId },
            },
          })),
       },
      },
      include: {
        orderItems: true,
      },
    });

    res.status(201).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.id;

    const orders = await prisma.order.findMany({
      where: { studentId },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        vendor: {
          select:{
            id: true,
            email:true,
            name:true,
            phone:true,
            location:true,
            createdAt:true,
            updatedAt:true,
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.id;
    const orderId  = Number(req.params.orderId);

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        studentId,
      },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        vendor: {
          select:{
            id: true,
            email:true,
            name:true,
            phone:true,
            location:true,
            createdAt:true,
            updatedAt:true,
          }
        },
      },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const trackOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.user!.id;
    const orderId = Number(req.params.orderId);

    const order = await prisma.order.findFirst({
      where: { id: orderId, studentId },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.user!.id;

    const orders = await prisma.order.findMany({
      where: { vendorId },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        student: {
          select:{
            id: true,
            email:true,
            name:true,
            phone:true,
            createdAt:true,
            updatedAt:true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getVendorOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.user!.id;
    const  orderId = Number(req.params.orderId);

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        vendorId,
      },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        student: {
          select:{
            id: true,
            email:true,
            name:true,
            phone:true,
            createdAt:true,
            updatedAt:true,
          }
        }
      },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.user!.id;
    const  orderId  = Number(req.params.orderId);
    const { status } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, vendorId },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }
    if (["CANCELLED", "COMPLETED"].includes(order.status)) {
         return next(new AppError(`Order is already ${order.status.toLowerCase()} and cannot be updated`,400 ));
   }

   

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.status(200).json({
      status: "success",
      data: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const  orderId  = Number(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (
      (role === "STUDENT" && order.studentId !== userId) ||
      (role === "VENDOR" && order.vendorId !== userId)
    ) {
      return next(new AppError("You are not authorized to cancel this order", 403));
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    res.status(200).json({
      status: "success",
      data: cancelledOrder,
    });
  } catch (err) {
    next(err);
  }
};
