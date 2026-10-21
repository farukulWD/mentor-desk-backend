import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import config from "./app/config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import routes from "./app/routes";

const app: Express = express();

app.use(cors({ origin: config.client_url, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "MentorDesk API is running" });
});

app.use("/api", routes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
