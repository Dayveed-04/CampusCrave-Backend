import express from "express";
import { getAllCategories } from "../controllers/category-controller";

const categoryRoutes = express.Router();


categoryRoutes.get("/", getAllCategories);

export default categoryRoutes;
