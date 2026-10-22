import { CookieOptions, Response } from "express";
import config from "../../config";
import { getTokenExpiry } from "../../utils/jwt";
import { AUTH_COOKIE } from "./auth.constant";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.isProd,
  path: "/",
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE, token, {
    ...cookieOptions,
    expires: getTokenExpiry(token),
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
};
