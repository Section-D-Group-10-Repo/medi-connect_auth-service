import { Gender, Role } from "@prisma/client";
import * as z from "zod";

const userSchema = z.object({
  firstName: z
    .string({ message: "First name must be a string" })
    .trim()
    .min(1, { message: "First name is required" }),
  lastName: z
    .string({ message: "Last name must be a string" })
    .trim()
    .min(1, { message: "Last name is required" }),
  email: z
    .string({ message: "Email must be a string" })
    .trim()
    .email({ message: "Invalid email address" }),
  password: z
    .string({ message: "Password must be a string" })
    .trim()
    .min(8, { message: "Password must be at least 8 characters long" }),
  phoneNumber: z
    .string({ message: "Phone number must be a string" })
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, { message: "Invalid phone number" }),
});

export const adminSignUpSchema = userSchema.extend({});

export const patientSignUpSchema = userSchema.extend({
  dateOfBirth: z.coerce.date({
    message: "Date of birth must be a valid ISO string",
  }),
  gender: z.enum([Gender.MALE, Gender.FEMALE], { message: "Invalid gender" }),
});

export const doctorSignUpSchema = userSchema.extend({
  gender: z.enum([Gender.MALE, Gender.FEMALE], { message: "Invalid gender" }),
  specializations: z
    .string({ message: "Specialization must be a string" })
    .min(1, { message: "At least one specialization is required" })
    .refine((value) => value.split(",").map((v) => v.trim()).length > 0, {
      message: "At least one specialization is required",
    }),
  qualifications: z
    .string({ message: "Qualification must be a string" })
    .min(1, { message: "At least one qualification is required" })
    .refine((value) => value.split(",").map((v) => v.trim()).length > 0, {
      message: "At least one qualification is required",
    }),
  yearsOfExperience: z.coerce
    .number({ message: "Years of experience must be a number" })
    .int({ message: "Years of experience must be an integer" })
    .min(0, { message: "Years of experience cannot be negative" }),
  bio: z
    .string({ message: "Bio must be a string" })
    .max(500, { message: "Bio cannot exceed 500 characters" })
    .optional(),
});

export const signInSchema = z.object({
  email: z.string({ message: "Email has to be a string" }).email({
    message: "Invalid email.",
  }),
  password: z.string({ message: "Password has to be a string" }).trim().min(1, {
    message: "Password field is required.",
  }),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ message: "Current password has to be a string" })
    .trim()
    .min(1, {
      message: "Current password field is required.",
    }),
  newPassword: z
    .string({ message: "New password has to be a string" })
    .trim()
    .min(1, {
      message: "New password field is required.",
    }),
});
