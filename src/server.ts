import { Server } from "http";
import app from "./app";
import config from "./app/config";
import prisma from "./app/lib/prisma";

let server: Server | undefined;

async function shutdown(code: number) {
  if (server) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
  }
  await prisma.$disconnect();
  process.exit(code);
}

async function main() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected");

    server = app.listen(config.port, () => {
      console.log(`Server running at http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection", reason);
  shutdown(1);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
  process.exit(1);
});

main();
