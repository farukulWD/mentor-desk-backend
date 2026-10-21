export type TErrorFields = Record<string, string>;

class AppError extends Error {
  public statusCode: number;
  public errors?: TErrorFields;

  constructor(statusCode: number, message: string, errors?: TErrorFields) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
