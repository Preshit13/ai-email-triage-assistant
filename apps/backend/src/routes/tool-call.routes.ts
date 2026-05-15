import { Router } from "express";

import {
  getToolCalls,
  executeTools,
  executeSingleTool,
} from "../controllers/tool-call.controller";

const router = Router();

router.get("/", getToolCalls);

router.post("/execute", executeTools);

router.post("/:id/execute", executeSingleTool);

export default router;
