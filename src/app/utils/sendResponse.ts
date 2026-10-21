import { Response } from "express";

export type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type TResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta;
};

const sendResponse = <T>(res: Response, payload: TResponse<T>) => {
  res.status(payload.statusCode).json({
    success: true,
    message: payload.message,
    data: payload.data,
    ...(payload.meta && { meta: payload.meta }),
  });
};

export default sendResponse;
