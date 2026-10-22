import rateLimit, { Options } from "express-rate-limit";
import { status } from "http-status";

type TRateLimiterOptions = {
  windowMs: number;
  limit: number;
  message: string;
  keyGenerator?: Options["keyGenerator"];
};

export const createRateLimiter = ({
  windowMs,
  limit,
  message,
  keyGenerator,
}: TRateLimiterOptions) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ...(keyGenerator && { keyGenerator }),
    handler: (_req, res) => {
      res.status(status.TOO_MANY_REQUESTS).json({ success: false, message });
    },
  });

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many attempts, please try again later",
});
