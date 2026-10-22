import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../config";
import { Role } from "../../generated/prisma/enums";

export type TJwtPayload = {
  userId: string;
  role: Role;
};

export const signToken = (payload: TJwtPayload) =>
  jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expires_in as SignOptions["expiresIn"],
  });

export const verifyToken = (token: string) =>
  jwt.verify(token, config.jwt.secret) as JwtPayload & TJwtPayload;

export const getTokenExpiry = (token: string) => {
  const decoded = jwt.decode(token) as JwtPayload | null;
  return decoded?.exp ? new Date(decoded.exp * 1000) : undefined;
};
