import { status } from "http-status";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { REFRESH_COOKIE } from "./auth.constant";
import { AuthService } from "./auth.service";
import { clearAuthCookies, setAuthCookies } from "./auth.utils";

const signup = catchAsync(async (req, res) => {
  const { refreshToken, ...result } = await AuthService.signup(req.body);
  setAuthCookies(res, { accessToken: result.accessToken, refreshToken });

  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Account created",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const { refreshToken, ...result } = await AuthService.login(req.body);
  setAuthCookies(res, { accessToken: result.accessToken, refreshToken });

  sendResponse(res, {
    statusCode: status.OK,
    message: "Logged in",
    data: result,
  });
});

const refresh = catchAsync(async (req, res) => {
  const token: string | undefined = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    throw new AppError(status.UNAUTHORIZED, "You are not logged in");
  }

  const { refreshToken, ...result } = await AuthService.refresh(token);
  setAuthCookies(res, { accessToken: result.accessToken, refreshToken });

  sendResponse(res, {
    statusCode: status.OK,
    message: "Token refreshed",
    data: result,
  });
});

const logout = catchAsync(async (_req, res) => {
  clearAuthCookies(res);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Logged out",
    data: null,
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = await AuthService.getMe(req.user!.id);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Current user",
    data: user,
  });
});

export const AuthController = { signup, login, refresh, logout, getMe };
