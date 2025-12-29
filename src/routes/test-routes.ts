import express from "express";
import { protect, restrictTo } from "../middlewares/auth-middleware";

const testRoutes = express.Router();

// Only logged-in users
testRoutes.get("/protected", protect, (req, res) => {
  res.json({
    status: "success",
    message: "You are authenticated",
    user: req.user,
  });
});

// Only STUDENTS
testRoutes.get(
  "/student-only",
  protect,
  restrictTo("STUDENT"),
  (req, res) => {
    res.json({
      status: "success",
      message: "Welcome student",
    });
  }
);

// Only VENDORS
testRoutes.get(
  "/vendor-only",
  protect,
  restrictTo("VENDOR"),
  (req, res) => {
    res.json({
      status: "success",
      message: "Welcome vendor",
    });
  }
);

// Only ADMIN
testRoutes.get(
  "/admin-only",
  protect,
  restrictTo("ADMIN"),
  (req, res) => {
    res.json({
      status: "success",
      message: "Welcome admin",
    });
  }
);

export default testRoutes;
