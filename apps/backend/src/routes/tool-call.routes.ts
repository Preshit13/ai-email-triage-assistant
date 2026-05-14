import { Router } from "express";

import { getToolCalls } from "../controllers/tool-call.controller";

const router = Router();

router.get("/", getToolCalls);

export default router;
