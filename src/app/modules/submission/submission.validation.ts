import { z } from "zod";
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

export type TSubmissionPayload = z.infer<typeof submissionBody>;

export const SubmissionValidation = { createSubmissionSchema, resubmitSchema };
