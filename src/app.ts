import express from "express";
import cors from "cors";
import morgan from "morgan";
import prisma from "./config/database";
import { globalErrorHandler } from "./middlewares/error-middleware";
import authRoutes from "./routes/auth-routes";
import testRoutes from "./routes/test-routes";

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
app.use("/api/test", testRoutes);


app.use(globalErrorHandler);
export default app;