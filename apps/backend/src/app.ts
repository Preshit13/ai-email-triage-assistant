import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/health", healthRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;
