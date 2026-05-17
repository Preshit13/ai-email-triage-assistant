import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function simulateExecution(toolName: string, toolCallId: string) {
  switch (toolName) {
    case "schedule_meeting":
      return {
        success: true,
        meetingId: `meeting_${toolCallId}`,
      };

    case "draft_response":
      return {
        success: true,
        drafted: true,
        responseId: `draft_${toolCallId}`,
      };

    case "create_task":
      return {
        success: true,
        taskId: `task_${toolCallId}`,
      };

    case "flag_urgent":
      return {
        success: true,
        flagged: true,
        flagId: `flag_${toolCallId}`,
      };

    case "escalate_to_manager":
      return {
        success: true,
        escalationId: `escalation_${toolCallId}`,
      };

    case "archive_no_action":
      return {
        success: true,
        archived: true,
        archiveId: `archive_${toolCallId}`,
      };

    default:
      return {
        success: true,
      };
  }
}

export async function executeSingleToolCall(toolCallId: string) {
  const toolCall = await prisma.toolCall.findUnique({
    where: {
      id: toolCallId,
    },

    include: {
      execution: true,
    },
  });

  if (!toolCall) {
    throw new Error("Tool call not found");
  }

  if (toolCall.execution) {
    return toolCall.execution;
  }

  const result = simulateExecution(toolCall.toolName, toolCall.id);

  return prisma.toolExecution.create({
    data: {
      toolCallId: toolCall.id,
      executionResultJson: result,
    },
  });
}

export async function executePendingToolCalls() {
  const toolCalls = await prisma.toolCall.findMany({
    where: {
      execution: null,
    },
  });

  console.log(`Found ${toolCalls.length} tool calls to execute`);

  for (const toolCall of toolCalls) {
    try {
      const result = simulateExecution(toolCall.toolName, toolCall.id);

      await prisma.toolExecution.create({
        data: {
          toolCallId: toolCall.id,
          executionResultJson: result,
        },
      });

      console.log(`Executed tool: ${toolCall.toolName}`);
    } catch (error) {
      console.error(`Failed executing tool call: ${toolCall.id}`);
    }
  }
}
