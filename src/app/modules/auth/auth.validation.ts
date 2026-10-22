import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("Invalid email"));

const signupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    email,
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/\d/, "Password must contain a number"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, "Password is required"),
  }),
});

export type TSignupPayload = z.infer<typeof signupSchema>["body"];
export type TLoginPayload = z.infer<typeof loginSchema>["body"];

export const AuthValidation = { signupSchema, loginSchema };
