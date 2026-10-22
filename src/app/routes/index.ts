import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { HealthRoutes } from "../modules/health/health.route";

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  { path: "/health", route: HealthRoutes },
  { path: "/auth", route: AuthRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
