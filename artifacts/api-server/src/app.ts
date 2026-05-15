import express, { type Express } from "express";
import cors from "cors";
import { Request, Response } from "express";
// @ts-ignore
const pinoHttp = require("pino-http");

import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// --------------------
// LOGGING
// --------------------
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: Request) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: Response) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

// --------------------
// CORS (FIXED)
// --------------------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 ВАЖНО: явная обработка preflight
app.options("/{*path}", cors());

// --------------------
// BODY PARSERS
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// ROUTES
// --------------------
app.use("/api", router);

export default app;