import express from "express";
import cors from "cors";
import morgan from "morgan";
import prisma from "./config/database";
import { globalErrorHandler } from "./middlewares/error-middleware";
import authRoutes from "./routes/auth-routes";
import testRoutes from "./routes/test-routes";
import studentRoutes from "./routes/student-routes";
import vendorRoutes from "./routes/vendor-routes";
import orderRoutes from "./routes/order-routes";
import categoryRoutes from "./routes/category-routes";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", async (req, res) => {
    try{
        await prisma.$connect();
        res.json({ 
         status: "success",
         message: "CampusCrave API is running" 
        }); 
    }catch(error){
        res.status(500).json({ status: "Error", db: "Disconnected" });
    }
});     

app.use("/api/auth",authRoutes);
// app.use("/api/test", testRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);




app.use(globalErrorHandler);
export default app;