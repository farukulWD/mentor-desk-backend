import { status } from "http-status";
import AppError from "../../errors/AppError";
import prisma from "../../lib/prisma";
import { signToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { Role } from "../../../generated/prisma/enums";
import { userSafeSelect } from "./auth.constant";
import { TLoginPayload, TSignupPayload } from "./auth.validation";

const signup = async ({ name, email, password }: TSignupPayload) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(status.CONFLICT, "Email already registered", {
      email: "Email already registered",
    });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: Role.STUDENT,
    },
    select: userSafeSelect,
  });

  const accessToken = signToken({ userId: user.id, role: user.role });
  return { user, accessToken };
};

const login = async ({ email, password }: TLoginPayload) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  const { passwordHash: _passwordHash, updatedAt: _updatedAt, ...safeUser } = user;
  const accessToken = signToken({ userId: user.id, role: user.role });
  return { user: safeUser, accessToken };
};

const getMe = (userId: string) =>
  prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: userSafeSelect,
  });

export const AuthService = { signup, login, getMe };
