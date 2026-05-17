import { Router } from "express";

import {
  getEmails,
  processEmails,
  retryEmailProcessing,
} from "../controllers/email.controller";

const router = Router();

router.get("/", getEmails);

router.post("/process", processEmails);

router.post("/:id/retry", retryEmailProcessing);

export default router;
