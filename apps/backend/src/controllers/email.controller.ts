import { Request, Response } from "express";
import prisma from "../config/prisma";
import { processPendingEmails } from "../services/triage.service";

export async function getEmails(req: Request, res: Response) {
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
