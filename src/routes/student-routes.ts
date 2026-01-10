import express from "express";
import {  getAllMenus, getMe, getMenuById, getRecommendations, getVendorMenus, updateMe } from "../controllers/student-controller";
import { protect, restrictTo } from "../middlewares/auth-middleware";

const studentRoutes = express.Router();

studentRoutes.use(protect);
studentRoutes.use(restrictTo("STUDENT"));

studentRoutes.get("/me", getMe);
studentRoutes.patch("/me", updateMe);
studentRoutes.get("/menus", getAllMenus);
studentRoutes.get("/vendors/:vendorId/menus", getVendorMenus);2
studentRoutes.get("/menus/:menuId", getMenuById);
studentRoutes.get("/recommendations", getRecommendations);




export default studentRoutes;