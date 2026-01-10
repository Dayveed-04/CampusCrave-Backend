import express from "express";

import { protect, restrictTo } from "../middlewares/auth-middleware";
import { cancelOrder, createOrder, getStudentOrderById, getStudentOrders, getVendorOrderById, getVendorOrders, trackOrderStatus, updateOrderStatus } from "../controllers/order-controller";




const orderRoutes= express.Router();

orderRoutes.use(protect);

orderRoutes.post("/student", restrictTo("STUDENT"), createOrder);
orderRoutes.get("/student", restrictTo("STUDENT"), getStudentOrders);
orderRoutes.get("/student/:orderId", restrictTo("STUDENT"), getStudentOrderById);
orderRoutes.get("/student/:orderId/trackstatus", restrictTo("STUDENT"), trackOrderStatus);
orderRoutes.patch("/student/:orderId/cancel", restrictTo("STUDENT"), cancelOrder);


orderRoutes.get("/vendor", restrictTo("VENDOR"), getVendorOrders);
orderRoutes.get("/vendor/:orderId", restrictTo("VENDOR"), getVendorOrderById);
orderRoutes.patch("/vendor/:orderId/status", restrictTo("VENDOR"), updateOrderStatus);
orderRoutes.patch("/vendor/:orderId/cancel", restrictTo("VENDOR"), cancelOrder);

export default orderRoutes;
