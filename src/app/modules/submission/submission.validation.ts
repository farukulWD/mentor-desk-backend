import { z } from "zod";
import { SubmissionStatus } from "../../../generated/prisma/enums";
import { PAGINATION, STATUS_FILTERS } from "./submission.constant";
import { normalizeRepoUrl } from "./submission.utils";

const GITHUB_REPO_REGEX =
  /^https:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\.git)?\/?$/i;

const submissionBody = z.object({
  projectName: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be at most 100 characters"),
  repoUrl: z
    .string()
    .trim()
    .regex(
      GITHUB_REPO_REGEX,
      "Must be a GitHub repo URL (https://github.com/owner/repo)",
    )
    .transform(normalizeRepoUrl),
  liveUrl: z
    .string()
    .trim()
    .pipe(z.url({ protocol: /^https?$/, message: "Invalid live URL" })),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be at most 1000 characters"),
});

const createSubmissionSchema = z.object({
  body: submissionBody,
});

const resubmitSchema = z.object({
  params: z.object({ id: z.uuid("Invalid submission id") }),
  body: submissionBody,
});

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const listSubmissionsQuery = z.object({
  status: z.preprocess(
    (value) => (typeof value === "string" ? value.toUpperCase() : value),
    z.enum(STATUS_FILTERS, "Invalid status filter").default("ALL"),
  ),
  page: z.coerce
    .number("Page must be a number")
    .int()
    .min(1, "Page must be at least 1")
    .default(1),
  limit: z.coerce
    .number("Limit must be a number")
    .int()
    .min(1, "Limit must be at least 1")
    .max(PAGINATION.maxLimit, `Limit must be at most ${PAGINATION.maxLimit}`)
    .default(PAGINATION.defaultLimit),
  search: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(100, "Search must be at most 100 characters")
      .optional(),
  ),
});

const listSubmissionsSchema = z.object({
  query: listSubmissionsQuery,
});

const reviewBody = z
  .object({
    status: z.enum(
      [SubmissionStatus.APPROVED, SubmissionStatus.REJECTED],
      "Status must be APPROVED or REJECTED",
    ),
    feedback: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .max(500, "Feedback must be at most 500 characters")
        .optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.status === SubmissionStatus.REJECTED && !data.feedback) {
      ctx.addIssue({
        code: "custom",
        path: ["feedback"],
        message: "Feedback is required when rejecting",
      });
    }
  });

const reviewSchema = z.object({
  params: z.object({ id: z.uuid("Invalid submission id") }),
  body: reviewBody,
});

export type TSubmissionPayload = z.infer<typeof submissionBody>;
export type TListSubmissionsQuery = z.infer<typeof listSubmissionsQuery>;
export type TReviewPayload = z.infer<typeof reviewBody>;

export const SubmissionValidation = {
  createSubmissionSchema,
  resubmitSchema,
  listSubmissionsSchema,
  reviewSchema,
};
