import { status } from "http-status";
import AppError from "../errors/AppError";
import prisma from "../lib/prisma";
import { AUTH_COOKIE, userSafeSelect } from "../modules/auth/auth.constant";
import catchAsync from "../utils/catchAsync";
import { verifyToken } from "../utils/jwt";
import { Role } from "../../generated/prisma/enums";

const getBearerToken = (header?: string) =>
  header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;

const auth = (...roles: Role[]) =>
  catchAsync(async (req, _res, next) => {
    const token =
      req.cookies?.[AUTH_COOKIE] ?? getBearerToken(req.headers.authorization);

    if (!token) {
      throw new AppError(status.UNAUTHORIZED, "You are not logged in");
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: userSafeSelect,
    });

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "User no longer exists");
    }

    if (roles.length && !roles.includes(user.role)) {
      throw new AppError(status.FORBIDDEN, "Forbidden");
    }

    req.user = user;
    next();
  });

export default auth;
