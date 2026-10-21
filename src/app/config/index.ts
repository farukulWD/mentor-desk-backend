import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: [path.join(process.cwd(), ".env")] });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5001),
  DATABASE_URL: z.url(),
  CLIENT_URL: z.url().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

const env = parsed.data;

export default {
  env: env.NODE_ENV,
  isProd: env.NODE_ENV === "production",
  port: env.PORT,
  database_url: env.DATABASE_URL,
  client_url: env.CLIENT_URL,
};
