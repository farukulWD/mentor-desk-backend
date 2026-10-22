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
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
  SEED_MENTOR_NAME: z.string().default("Admin Mentor"),
  SEED_MENTOR_EMAIL: z.email().optional(),
  SEED_MENTOR_PASSWORD: z.string().min(8).optional(),
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
  bcrypt_salt_rounds: env.BCRYPT_SALT_ROUNDS,
  seed: {
    mentor_name: env.SEED_MENTOR_NAME,
    mentor_email: env.SEED_MENTOR_EMAIL,
    mentor_password: env.SEED_MENTOR_PASSWORD,
  },
};
