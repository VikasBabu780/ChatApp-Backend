import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters.")
    .max(50, "Full name cannot exceed 50 characters."),

  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username cannot exceed 20 characters.")
    .regex(
      /^[a-z0-9._]+$/,
      "Username can contain only lowercase letters, numbers, dots and underscores."
    ),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address."),

  mobileNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits.")
    .optional()
    .or(z.literal("")),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(32, "Password cannot exceed 32 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character."
    ),
});

export const verifyOTPSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address."),

  otp: z
    .string()
    .trim()
    .length(6, "OTP must be exactly 6 digits.")
    .regex(/^\d+$/, "OTP must contain only numbers."),
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Email or username is required."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address."),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(32, "Password cannot exceed 32 characters.")
    .regex(
      /[A-Z]/,
      "Password must contain at least one uppercase letter.",
    )
    .regex(
      /[a-z]/,
      "Password must contain at least one lowercase letter.",
    )
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character.",
    ),
});