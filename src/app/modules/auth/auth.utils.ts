import { CookieOptions, Response } from "express";
import config from "../../config";
import { getTokenExpiry } from "../../utils/jwt";
import { AUTH_COOKIE, REFRESH_COOKIE } from "./auth.constant";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.isProd,
  path: "/",
};

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const setAuthCookies = (
  res: Response,
  { accessToken, refreshToken }: TAuthTokens,
) => {
  res.cookie(AUTH_COOKIE, accessToken, {
    ...cookieOptions,
    expires: getTokenExpiry(accessToken),
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    expires: getTokenExpiry(refreshToken),
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
};
