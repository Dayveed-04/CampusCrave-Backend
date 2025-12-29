import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
 import prisma from "../config/database";
import { PrismaClient } from "@prisma/client";
import type { Role } from "../types/prismaEnums";
import { AppError } from "../utils/appError";
import { signToken } from "../utils/jwt-util";



const STUDENT_EMAIL_REGEX = /^[a-z0-9._%+-]+@student.babcock.edu.ng$/i;
const LECTURER_EMAIL_REGEX = /^[a-z0-9._%+-]+@lecturer.babcock.edu.ng$/i;

export const registerStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, phone,confirmPassword } = req.body;


    if (!email || !password || !name || !phone|| !confirmPassword ) {
      return next(new AppError("Email, password and name are required", 400));
    }
    if (password !== confirmPassword) {
      return next(new AppError("Passwords do not match", 400));
    }


  
    if (!STUDENT_EMAIL_REGEX.test(email) && !LECTURER_EMAIL_REGEX.test(email)) {
      return next(new AppError("Email must be a valid Babcock student or lecturer email", 400));
    }

    const existingUser = await prisma.student.findUnique({ where: { email } })
      || await prisma.vendor.findUnique({ where: { email } })
      || await prisma.admin.findUnique({ where: { email } });

    if (existingUser) {
      return next(new AppError("Email already registered", 409));
    }
    const hashedPassword = await bcrypt.hash(password, 12);


    const student = await prisma.student.create({
      data: { email, password: hashedPassword, name, phone },
    });

    const token = signToken({id:student.id});
    res.status(201).json({
      status: "success",
      message: "Student registered successfully.",
      data: {
        student: { id: student.id, email: student.email, name: student.name, phone: student.phone ,role:"STUDENT",createdAt:student.createdAt},
      },
    });
  } catch (error) {
    next(error);
  }
};


export const registerVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, phone, location } = req.body;

    if (!email || !password || !name || !location) {
      return next(new AppError("Email, password, name, and location are required", 400));
    }

    const existingUser = await prisma.vendor.findUnique({ where: { email } })
      || await prisma.student.findUnique({ where: { email } })
      || await prisma.admin.findUnique({ where: { email } });

    if (existingUser) {
      return next(new AppError("Email already registered", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const vendor = await prisma.vendor.create({
      data: { email, password: hashedPassword, name, phone, location },
    });


    res.status(201).json({
      status: "success",
      message: "Vendor registered successfully.",
      data: {
        vendor: { id: vendor.id, email: vendor.email, name: vendor.name, location: vendor.location },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    let user: any = null;
    let role: "STUDENT" | "VENDOR" | "ADMIN" | null = null;

    user = await prisma.student.findUnique({ where: { email } });
    if (user) {
      role = "STUDENT";
    } else {
      user = await prisma.vendor.findUnique({ where: { email } });
      if (user) {
        role = "VENDOR";
      } else {
        user = await prisma.admin.findUnique({ where: { email } });
        if (user) {
          role = "ADMIN";
        }
      }
    }

    if (!user || !role) {
      return next(new AppError("Invalid email or password", 401));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = signToken({ userId: user.id, role });

    res.json({
      status: "success",
      token,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
