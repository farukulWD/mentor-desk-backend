import { status } from "http-status";
import { ZodError } from "zod";
import { TErrorFields } from "./AppError";
import { TGenericErrorResponse } from "./types";

const REQUEST_PARTS = ["body", "query", "params"];

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errors: TErrorFields = {};

  for (const issue of err.issues) {
    const path = issue.path.map(String);
    if (path.length > 1 && REQUEST_PARTS.includes(path[0])) path.shift();
    const key = path.join(".") || "root";
    if (!errors[key]) errors[key] = issue.message;
  }

  return {
    statusCode: status.BAD_REQUEST,
    message: "Validation failed",
    errors,
  };
};

export default handleZodError;
