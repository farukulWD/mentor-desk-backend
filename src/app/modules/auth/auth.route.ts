import { Router } from "express";
import auth from "../../middlewares/auth";
import { authLimiter } from "../../middlewares/rateLimiter";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/signup",
  authLimiter,
  validateRequest(AuthValidation.signupSchema),
  AuthController.signup,
);
router.post(
  "/login",
  authLimiter,
  validateRequest(AuthValidation.loginSchema),
  AuthController.login,
);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.get("/me", auth(), AuthController.getMe);

export const AuthRoutes = router;
