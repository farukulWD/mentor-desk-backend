import { Router } from "express";
import auth from "../../middlewares/auth";
import { submitLimiter } from "../../middlewares/rateLimiter";
import validateRequest from "../../middlewares/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { SubmissionController } from "./submission.controller";
import { SubmissionValidation } from "./submission.validation";

const router = Router();

router.get(
  "/",
  auth(Role.MENTOR),
  validateRequest(SubmissionValidation.listSubmissionsSchema),
  SubmissionController.getAllSubmissions,
);
router.post(
  "/",
  auth(Role.STUDENT),
  submitLimiter,
  validateRequest(SubmissionValidation.createSubmissionSchema),
  SubmissionController.createSubmission,
);
router.get("/me", auth(Role.STUDENT), SubmissionController.getMySubmissions);
router.get(
  "/stats",
  auth(Role.MENTOR),
  SubmissionController.getSubmissionStats,
);
router.patch(
  "/:id/resubmit",
  auth(Role.STUDENT),
  submitLimiter,
  validateRequest(SubmissionValidation.resubmitSchema),
  SubmissionController.resubmitSubmission,
);

router.patch(
  "/:id/review",
  auth(Role.MENTOR),
  validateRequest(SubmissionValidation.reviewSchema),
  SubmissionController.reviewSubmission,
);

export const SubmissionRoutes = router;
