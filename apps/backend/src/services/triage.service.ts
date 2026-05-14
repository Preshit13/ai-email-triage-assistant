import { PrismaClient, ToolName } from "@prisma/client";

const prisma = new PrismaClient();

function determineTool(emailText: string): ToolName {
  const content = emailText.toLowerCase();

  if (
    content.includes("meeting") ||
    content.includes("schedule") ||
    content.includes("calendar")
  ) {
    return "schedule_meeting";
  }

  if (
    content.includes("urgent") ||
    content.includes("asap") ||
    content.includes("immediately")
  ) {
    return "flag_urgent";
  }

  if (content.includes("reply") || content.includes("respond")) {
    return "draft_response";
  }

  if (content.includes("task") || content.includes("follow up")) {
    return "create_task";
  }

  return "archive_no_action";
}

export async function processPendingEmails() {
  const pendingEmails = await prisma.email.findMany({
    where: {
      processingStatus: "PENDING",
    },
  });

  console.log(`Found ${pendingEmails.length} pending emails`);

  for (const email of pendingEmails) {
    try {
      const tool = determineTool(`${email.subject} ${email.body}`);

      await prisma.toolCall.create({
        data: {
          emailId: email.id,
          toolName: tool,
          rationale: `Rule-based triage selected ${tool}`,
          argumentsJson: {
            subject: email.subject,
          },
        },
      });

      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          processingStatus: "COMPLETED",
        },
      });

      console.log(`Processed email: ${email.subject}`);
    } catch (error) {
      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          processingStatus: "FAILED",
          processingError:
            error instanceof Error ? error.message : "Unknown error",
        },
      });

      console.error(`Failed processing email: ${email.subject}`);
    }
  }
}
