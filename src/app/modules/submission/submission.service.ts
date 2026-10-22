import { status } from "http-status";
import AppError, { TErrorFields } from "../../errors/AppError";
import prisma from "../../lib/prisma";
import { SubmissionStatus } from "../../../generated/prisma/enums";
import { submissionSelect } from "./submission.constant";
import {
  DUPLICATE_MESSAGES,
  duplicateError,
  mapDuplicateError,
  toProjectNameKey,
} from "./submission.utils";
import { TSubmissionPayload } from "./submission.validation";

const assertNoDuplicate = async (
  studentId: string,
  repoUrl: string,
  projectNameKey: string,
  excludeId?: string,
) => {
  const matches = await prisma.submission.findMany({
    where: {
      OR: [{ repoUrl }, { studentId, projectNameKey }],
      ...(excludeId && { NOT: { id: excludeId } }),
    },
    select: { repoUrl: true, studentId: true, projectNameKey: true },
  });

  const errors: TErrorFields = {};
  for (const match of matches) {
    if (match.repoUrl === repoUrl) {
      errors.repoUrl = DUPLICATE_MESSAGES.repoUrl;
    }
    if (
      match.studentId === studentId &&
      match.projectNameKey === projectNameKey
    ) {
      errors.projectName = DUPLICATE_MESSAGES.projectName;
    }
  }

  if (Object.keys(errors).length) throw duplicateError(errors);
};

const createSubmission = async (
  studentId: string,
  payload: TSubmissionPayload,
) => {
  const projectNameKey = toProjectNameKey(payload.projectName);
  await assertNoDuplicate(studentId, payload.repoUrl, projectNameKey);

  return prisma.submission
    .create({
      data: { ...payload, projectNameKey, studentId },
      select: submissionSelect,
    })
    .catch(mapDuplicateError);
};

const getMySubmissions = (studentId: string) =>
  prisma.submission.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: submissionSelect,
  });

const resubmitSubmission = async (
  studentId: string,
  id: string,
  payload: TSubmissionPayload,
) => {
  const submission = await prisma.submission.findUnique({ where: { id } });

  if (!submission || submission.studentId !== studentId) {
    throw new AppError(status.NOT_FOUND, "Submission not found");
  }

  if (submission.status !== SubmissionStatus.REJECTED) {
    throw new AppError(
      status.CONFLICT,
      "Only rejected submissions can be resubmitted",
    );
  }

  const projectNameKey = toProjectNameKey(payload.projectName);
  await assertNoDuplicate(studentId, payload.repoUrl, projectNameKey, id);

  return prisma.submission
    .update({
      where: { id },
      data: {
        ...payload,
        projectNameKey,
        status: SubmissionStatus.PENDING,
        feedback: null,
        reviewedById: null,
        reviewedAt: null,
      },
      select: submissionSelect,
    })
    .catch(mapDuplicateError);
};

export const SubmissionService = {
  createSubmission,
  getMySubmissions,
  resubmitSubmission,
};
