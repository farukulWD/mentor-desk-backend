import { SubmissionStatus } from "../../../generated/prisma/enums";

export const submissionSelect = {
  id: true,
  projectName: true,
  repoUrl: true,
  liveUrl: true,
  description: true,
  status: true,
  feedback: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const reviewSubmissionSelect = {
  ...submissionSelect,
  student: { select: { id: true, name: true, email: true } },
  reviewedBy: { select: { id: true, name: true } },
} as const;

export const STATUS_FILTERS = [
  "ALL",
  SubmissionStatus.PENDING,
  SubmissionStatus.APPROVED,
  SubmissionStatus.REJECTED,
] as const;

export const PAGINATION = { defaultLimit: 10, maxLimit: 50 } as const;
