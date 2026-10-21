import { RequestHandler } from "express";
import { ZodType } from "zod";

type TParsedRequest = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

const validateRequest =
  (schema: ZodType<TParsedRequest>): RequestHandler =>
  async (req, _res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) {
        Object.defineProperty(req, "query", {
          value: parsed.query,
          writable: true,
          configurable: true,
        });
      }
      if (parsed.params !== undefined) {
        req.params = parsed.params as typeof req.params;
      }

      next();
    } catch (err) {
      next(err);
    }
  };

export default validateRequest;
