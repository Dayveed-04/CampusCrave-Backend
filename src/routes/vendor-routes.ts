import express from "express";
import {
  getMe,
  updateMe,
  createMenu,
  getMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
} from "../controllers/vendor-controller";
import { protect, restrictTo } from "../middlewares/auth-middleware";

const vendorRoutes = express.Router();

vendorRoutes.use(protect);
vendorRoutes.use(restrictTo("VENDOR"));


vendorRoutes.get("/vendorme", getMe);
vendorRoutes.patch("/vendorme", updateMe);

vendorRoutes.post("/menusforvendor", createMenu);
vendorRoutes.get("/menusforvendor", getMenus);
vendorRoutes.get("/menusforvendor/:menuId", getMenuById);
vendorRoutes.patch("/menusforvendor/:menuId", updateMenu);
vendorRoutes.delete("/menusforvendor/:menuId", deleteMenu);





export default vendorRoutes;
