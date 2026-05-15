import express from "express";
import cors from "cors";
import emailRoutes from "./routes/email.routes";
import toolCallRoutes from "./routes/tool-call.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/emails", emailRoutes);
app.use("/tool-calls", toolCallRoutes);
app.use("/upload-csv", uploadRoutes);

export default app;
