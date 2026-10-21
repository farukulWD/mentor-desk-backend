import { TErrorFields } from "./AppError";

export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errors?: TErrorFields;
};
