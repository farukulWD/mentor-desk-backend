import { Role } from "../../generated/prisma/enums";

export type TAuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: TAuthUser;
    }
  }
}
