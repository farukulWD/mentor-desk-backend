import { ErrorRequestHandler } from "express";
import { status } from "http-status";
import { ZodError } from "zod";
import config from "../config";
import { Prisma } from "../../generated/prisma/client";
import AppError from "../errors/AppError";
import handleZodError from "../errors/handleZodError";
import {
  handlePrismaKnownError,
  handlePrismaValidationError,
} from "../errors/handlePrismaError";
import { TGenericErrorResponse } from "../errors/types";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let result: TGenericErrorResponse = {
    statusCode: status.INTERNAL_SERVER_ERROR,
    message: "Something went wrong",
  };

  if (err instanceof ZodError) {
    result = handleZodError(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    result = handlePrismaKnownError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    result = handlePrismaValidationError();
  } else if (err?.name === "TokenExpiredError") {
    result = { statusCode: status.UNAUTHORIZED, message: "Token expired" };
  } else if (err?.name === "JsonWebTokenError") {
    result = { statusCode: status.UNAUTHORIZED, message: "Invalid token" };
  } else if (err instanceof AppError) {
    result = {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    };
  } else if (err?.type === "entity.parse.failed") {
    result = { statusCode: status.BAD_REQUEST, message: "Malformed JSON body" };
  }

  if (result.statusCode >= 500) console.error(err);

  res.status(result.statusCode).json({
    success: false,
    message: result.message,
    ...(result.errors && { errors: result.errors }),
    ...(!config.isProd && err instanceof Error && { stack: err.stack }),
  });
};

export default globalErrorHandler;
