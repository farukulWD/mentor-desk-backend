import { Router } from "express";
import { HealthRoutes } from "../modules/health/health.route";

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  { path: "/health", route: HealthRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
