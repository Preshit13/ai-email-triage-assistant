import { Router } from "express";

import {
  getEmails,
  processEmails,
  retryFailedEmail,
  processSingleEmail,
} from "../controllers/email.controller";

const router = Router();

router.get("/", getEmails);

router.post("/process", processEmails);

router.post("/:id/process", processSingleEmail);

router.post("/:id/retry", retryFailedEmail);

export default router;
