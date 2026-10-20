import { Request, Response } from "express";
import app from "./app";
const port: number = 5001;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript & Express!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
