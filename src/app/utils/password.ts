import bcrypt from "bcryptjs";
import config from "../config";

export const hashPassword = (plain: string) =>
  bcrypt.hash(plain, config.bcrypt_salt_rounds);

export const comparePassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);
