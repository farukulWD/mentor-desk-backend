import { status } from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { TGenericErrorResponse } from "./types";

export const getUniqueFields = (meta: Record<string, unknown> | undefined) => {
  if (!meta) return [];
  if (Array.isArray(meta.target)) return meta.target as string[];
  if (typeof meta.target === "string") return [meta.target];

  const adapterFields = (
    meta.driverAdapterError as
      | { cause?: { constraint?: { fields?: string[] } } }
      | undefined
  )?.cause?.constraint?.fields;

  return adapterFields ?? [];
};

export const handlePrismaKnownError = (
  err: Prisma.PrismaClientKnownRequestError,
): TGenericErrorResponse => {
  switch (err.code) {
    case "P2002": {
      const fields = getUniqueFields(err.meta);
      const field = fields[0] ?? "field";
      return {
        statusCode: status.CONFLICT,
        message: "Duplicate value",
        errors: { [field]: `${field} already exists` },
      };
    }
    case "P2025":
      return { statusCode: status.NOT_FOUND, message: "Resource not found" };
    default:
      return { statusCode: status.BAD_REQUEST, message: "Database error" };
  }
};

export const handlePrismaValidationError = (): TGenericErrorResponse => ({
  statusCode: status.BAD_REQUEST,
  message: "Invalid data",
});
