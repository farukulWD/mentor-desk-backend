import { Request, Response } from "express";
import app from "./app";
import prisma from "./app/lib/prisma";
const port: number = 5001;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript & Express!");
});

async function main() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected");

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
