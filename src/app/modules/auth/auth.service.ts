import { status } from "http-status";
import AppError from "../../errors/AppError";
import prisma from "../../lib/prisma";
import {
  signRefreshToken,
  signToken,
  TJwtPayload,
  verifyRefreshToken,
} from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { Role } from "../../../generated/prisma/enums";
import { userSafeSelect } from "./auth.constant";
import { TLoginPayload, TSignupPayload } from "./auth.validation";

const issueTokens = (payload: TJwtPayload) => ({
  accessToken: signToken(payload),
  refreshToken: signRefreshToken(payload),
});

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

  return { user, ...issueTokens({ userId: user.id, role: user.role }) };
};

const login = async ({ email, password }: TLoginPayload) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  const { passwordHash: _passwordHash, updatedAt: _updatedAt, ...safeUser } = user;
  return {
    user: safeUser,
    ...issueTokens({ userId: user.id, role: user.role }),
  };
};

const refresh = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: userSafeSelect,
  });

  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "User no longer exists");
  }

  return { user, ...issueTokens({ userId: user.id, role: user.role }) };
};

const getMe = (userId: string) =>
  prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: userSafeSelect,
  });

export const AuthService = { signup, login, refresh, getMe };
