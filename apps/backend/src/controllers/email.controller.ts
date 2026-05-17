import { Request, Response } from "express";

import prisma from "../config/prisma";

import { processPendingEmails, triageEmail } from "../services/triage.service";

import { ProcessingStatus } from "@prisma/client";

export async function getEmails(req: Request, res: Response) {
  try {
    const emails = await prisma.email.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        toolCalls: {
          include: {
            execution: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: emails.length,
      data: emails,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed fetching emails",
    });
  }
}

export async function processEmails(req: Request, res: Response) {
  try {
    await processPendingEmails();

    res.json({
      success: true,
      message: "Email processing started",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed processing emails",
    });
  }
}

export async function processSingleEmail(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const email = await prisma.email.findUnique({
      where: {
        id,
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
        id,
      },
      data: {
        processingStatus: ProcessingStatus.PROCESSING,
        processingError: null,
      },
    });

    try {
      await triageEmail(id);

      const updatedEmail = await prisma.email.findUnique({
        where: {
          id,
        },
        include: {
          toolCalls: {
            include: {
              execution: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        message: "Email processed successfully",
        data: updatedEmail,
      });
    } catch (error) {
      await prisma.email.update({
        where: {
          id,
        },
        data: {
          processingStatus: ProcessingStatus.FAILED,
          processingError:
            error instanceof Error ? error.message : "Unknown error",
        },
      });

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed processing email",
      });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed processing email",
    });
  }
}

export async function retryFailedEmail(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const email = await prisma.email.findUnique({
      where: {
        id,
      },
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    await prisma.toolCall.deleteMany({
      where: {
        emailId: id,
      },
    });

    await prisma.email.update({
      where: {
        id,
      },
      data: {
        processingStatus: ProcessingStatus.PENDING,
        processingError: null,
      },
    });

    res.json({
      success: true,
      message: "Email reset for retry",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed retrying email",
    });
  }
}
