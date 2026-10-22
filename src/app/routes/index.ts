import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { HealthRoutes } from "../modules/health/health.route";
import { SubmissionRoutes } from "../modules/submission/submission.route";

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  { path: "/health", route: HealthRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/submissions", route: SubmissionRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
