import prisma from "../config/prisma";

import { ProcessingStatus, ToolName } from "@prisma/client";

import { classifyEmail } from "./groq.service";

export async function triageEmail(emailId: string) {
  const email = await prisma.email.findUnique({
    where: {
      id: emailId,
    },
  });

  if (!email) {
    throw new Error("Email not found");
  }

  const result = await classifyEmail(email.subject, email.body);

  const validTools: ToolName[] = [
    "schedule_meeting",
    "draft_response",
    "escalate_to_manager",
    "create_task",
    "flag_urgent",
    "archive_no_action",
  ];

  if (
    !result.toolCalls ||
    !Array.isArray(result.toolCalls) ||
    result.toolCalls.length === 0
  ) {
    throw new Error("No tool calls returned");
  }

  for (const toolCall of result.toolCalls) {
    if (!validTools.includes(toolCall.toolName)) {
      throw new Error(`Invalid tool returned: ${toolCall.toolName}`);
    }

    const toolName = toolCall.toolName as ToolName;

    await prisma.toolCall.create({
      data: {
        emailId: email.id,
        toolName,
        rationale: toolCall.rationale,
        argumentsJson: toolCall.arguments || {},
      },
    });

    console.log(`AI selected ${toolName} for email: ${email.subject}`);
  }

  await prisma.email.update({
    where: {
      id: email.id,
    },
    data: {
      processingStatus: ProcessingStatus.COMPLETED,
    },
  });
}

export async function processPendingEmails() {
  const pendingEmails = await prisma.email.findMany({
    where: {
      processingStatus: ProcessingStatus.PENDING,
    },
  });

  console.log(`Found ${pendingEmails.length} pending emails`);

  for (const email of pendingEmails) {
    try {
      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          processingStatus: ProcessingStatus.PROCESSING,
        },
      });

      await triageEmail(email.id);
    } catch (error) {
      console.error(`Failed processing email ${email.id}`, error);

      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          processingStatus: ProcessingStatus.FAILED,
          processingError:
            error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }
}
