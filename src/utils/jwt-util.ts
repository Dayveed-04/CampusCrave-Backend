import jwt,{SignOptions} from "jsonwebtoken";
import { AppError } from "./appError";

type StringValue = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;



const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d")as StringValue;

if (!JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export const signToken = (payload:string | Buffer | object ):string=>{
    const options: SignOptions = {
        expiresIn: JWT_EXPIRES_IN ,
    };
    return jwt.sign(payload, JWT_SECRET, options);
}

export const verifyToken = (token:string)=>{
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new AppError("Invalid or expired token",401);
    }
};