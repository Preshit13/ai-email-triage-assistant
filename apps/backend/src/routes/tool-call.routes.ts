import { Router } from "express";

import {
  getToolCalls,
  executeTools,
} from "../controllers/tool-call.controller";

const router = Router();

router.get("/", getToolCalls);

router.post("/execute", executeTools);

export default router;
