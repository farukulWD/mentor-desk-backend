import { status } from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { clearAuthCookie, setAuthCookie } from "./auth.utils";

const signup = catchAsync(async (req, res) => {
  const result = await AuthService.signup(req.body);
  setAuthCookie(res, result.accessToken);

  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Account created",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await AuthService.login(req.body);
  setAuthCookie(res, result.accessToken);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Logged in",
    data: result,
  });
});

const logout = catchAsync(async (_req, res) => {
  clearAuthCookie(res);

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

export const AuthController = { signup, login, logout, getMe };
