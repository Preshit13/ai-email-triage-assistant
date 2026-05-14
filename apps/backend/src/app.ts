import express from "express";

import emailRoutes from "./routes/email.routes";
import toolCallRoutes from "./routes/tool-call.routes";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/emails", emailRoutes);
app.use("/tool-calls", toolCallRoutes);

export default app;
