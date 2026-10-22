import { status } from "http-status";
import AppError, { TErrorFields } from "../../errors/AppError";
import { getUniqueFields } from "../../errors/handlePrismaError";
import { Prisma } from "../../../generated/prisma/client";

export const DUPLICATE_MESSAGES = {
  repoUrl: "This repository has already been submitted",
  projectName: "You already have a project with this name",
} as const;

export const normalizeRepoUrl = (url: string) =>
  url
    .trim()
    .toLowerCase()
    .replace(/\/+$/, "")
    .replace(/\.git$/, "")
    .replace(/\/+$/, "")
    .replace("://www.", "://");

export const toProjectNameKey = (name: string) => name.trim().toLowerCase();

export const duplicateError = (errors: TErrorFields) =>
  new AppError(status.CONFLICT, "Duplicate submission", errors);

export const mapDuplicateError = (err: unknown): never => {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    const fields = getUniqueFields(err.meta);
    throw duplicateError(
      fields.includes("repoUrl")
        ? { repoUrl: DUPLICATE_MESSAGES.repoUrl }
        : { projectName: DUPLICATE_MESSAGES.projectName },
    );
  }
  throw err;
};
