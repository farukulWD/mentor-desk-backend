import { status } from "http-status";
import prisma from "../../lib/prisma";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const getHealth = catchAsync(async (_req, res) => {
  let db: "up" | "down" = "up";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "down";
  }

  sendResponse(res, {
    statusCode: db === "up" ? status.OK : status.SERVICE_UNAVAILABLE,
    message: db === "up" ? "Service healthy" : "Database unreachable",
    data: {
      status: db === "up" ? "ok" : "degraded",
      db,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

export const HealthController = { getHealth };
