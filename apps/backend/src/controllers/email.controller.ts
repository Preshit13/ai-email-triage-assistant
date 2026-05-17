import { Request, Response } from "express";

import prisma from "../config/prisma";

import { processPendingEmails, triageEmail } from "../services/triage.service";

import { ProcessingStatus } from "@prisma/client";

export async function getEmails(_req: Request, res: Response) {
  try {
    const emails = await prisma.email.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        toolCalls: {
          include: {
            execution: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: emails.length,
      data: emails,
    });
  } catch (error) {
    console.error("Failed fetching emails", error);

    return res.status(500).json({
      success: false,
      message: "Failed fetching emails",
    });
  }
}

export async function processEmails(_req: Request, res: Response) {
  try {
    await processPendingEmails();

    return res.status(200).json({
      success: true,
      message: "Email processing started",
    });
  } catch (error) {
    console.error("Failed processing emails", error);

    return res.status(500).json({
      success: false,
      message: "Failed processing emails",
    });
  }
}

export async function retryEmailProcessing(req: Request, res: Response) {
  try {
    const emailId = req.params.id as string;

    const email = await prisma.email.findUnique({
      where: {
        id: emailId,
      },
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    await prisma.email.update({
      where: {
        id: emailId,
      },

      data: {
        processingStatus: ProcessingStatus.PENDING,
        processingError: null,
      },
    });

    await triageEmail(emailId);

    return res.status(200).json({
      success: true,
      message: "Email reprocessed successfully",
    });
  } catch (error) {
    console.error("Failed retrying email", error);

    return res.status(500).json({
      success: false,
      message: "Retry failed",
    });
  }
}
