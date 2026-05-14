import { Router } from "express";

import { getEmails, processEmails } from "../controllers/email.controller";

const router = Router();

router.get("/", getEmails);

router.post("/process", processEmails);

export default router;
