import { status } from "http-status";
import AppError, { TErrorFields } from "../../errors/AppError";
import prisma from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { SubmissionStatus } from "../../../generated/prisma/enums";
import {
  reviewSubmissionSelect,
  submissionSelect,
} from "./submission.constant";
import {
  DUPLICATE_MESSAGES,
  duplicateError,
  mapDuplicateError,
  toProjectNameKey,
} from "./submission.utils";
import {
  TListSubmissionsQuery,
  TReviewPayload,
  TSubmissionPayload,
} from "./submission.validation";

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

const getAllSubmissions = async ({
  status: statusFilter,
  page,
  limit,
  search,
}: TListSubmissionsQuery) => {
  const where: Prisma.SubmissionWhereInput = {
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(search && {
      OR: [
        { projectName: { contains: search, mode: "insensitive" } },
        { student: { email: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const [data, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: reviewSubmissionSelect,
    }),
    prisma.submission.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSubmissionStats = async () => {
  const groups = await prisma.submission.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const counts: Record<SubmissionStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  };
  for (const group of groups) counts[group.status] = group._count._all;

  return {
    total: counts.PENDING + counts.APPROVED + counts.REJECTED,
    pending: counts.PENDING,
    approved: counts.APPROVED,
    rejected: counts.REJECTED,
  };
};

const reviewSubmission = async (
  mentorId: string,
  id: string,
  payload: TReviewPayload,
) => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!submission) {
    throw new AppError(status.NOT_FOUND, "Submission not found");
  }

  return prisma.submission.update({
    where: { id },
    data: {
      status: payload.status,
      feedback: payload.feedback ?? null,
      reviewedById: mentorId,
      reviewedAt: new Date(),
    },
    select: reviewSubmissionSelect,
  });
};

export const SubmissionService = {
  createSubmission,
  getMySubmissions,
  resubmitSubmission,
  getAllSubmissions,
  getSubmissionStats,
  reviewSubmission,
};
