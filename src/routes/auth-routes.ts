import {Router} from "express";

import { login, registerStudent, registerVendor } from "../controllers/auth-controller";
import { validateLogin, validateRegisterStudent, validateRegisterVendor} from "../middlewares/validation-middleware";


const authRoutes = Router();

authRoutes.post("/student/register",validateRegisterStudent, registerStudent);

authRoutes.post("/vendor/register",validateRegisterVendor, registerVendor);

authRoutes.post("/login",validateLogin, login);


export default authRoutes;
