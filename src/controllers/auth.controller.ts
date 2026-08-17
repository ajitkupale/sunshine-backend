import { Request, Response, NextFunction } from "express";
import { Admin } from "../models/Admin";
import {
  generateAccessToken,
  generateRefreshToken,
  AuthPayload,
} from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

/** POST /api/auth/login */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError("Email and password are required", 400));
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return next(createError("Invalid credentials", 401));
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return next(createError("Invalid credentials", 401));
    }

    const payload: AuthPayload = {
      adminId: admin._id.toString(),
      email: admin.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      success: true,
      data: {
        admin: admin.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

/** POST /api/auth/refresh */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return next(createError("Refresh token required", 400));

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthPayload;

    const admin = await Admin.findById(decoded.adminId);
    if (!admin) return next(createError("Admin not found", 404));

    const payload: AuthPayload = {
      adminId: admin._id.toString(),
      email: admin.email,
    };

    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch {
    next(createError("Invalid or expired refresh token", 401));
  }
}

/** GET /api/auth/me */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await Admin.findById(req.admin?.adminId);
    if (!admin) return next(createError("Admin not found", 404));
    res.json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/auth/change-password */
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(createError("Both current and new password are required", 400));
    }
    if (newPassword.length < 8) {
      return next(createError("New password must be at least 8 characters", 400));
    }

    const admin = await Admin.findById(req.admin?.adminId);
    if (!admin) return next(createError("Admin not found", 404));

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) return next(createError("Current password is incorrect", 400));

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}
