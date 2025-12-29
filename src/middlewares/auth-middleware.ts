import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";

interface JwtPayload {
  userId: number;
  role: "STUDENT" | "VENDOR" | "ADMIN";
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: "STUDENT" | "VENDOR" | "ADMIN";
      };
    }
  }
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Headers received:", req.headers);
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
    console.log("Token from header:", token);
  }

  if (!token) {
    console.log("No token found in request");
    return next(new AppError("You are not logged in", 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;
    console.log("Decoded token:", decoded);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.log("Token verification failed:", err);
    return next(new AppError("Invalid or expired token", 401));
  }
};

export const restrictTo = (...roles: Array<"STUDENT" | "VENDOR" | "ADMIN">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

