import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function simulateExecution(toolName: string) {
  switch (toolName) {
    case "schedule_meeting":
      return {
        success: true,
        meetingId: `meet_${Date.now()}`,
      };

    case "draft_response":
      return {
        success: true,
        drafted: true,
      };

    case "create_task":
      return {
        success: true,
        taskId: `task_${Date.now()}`,
      };

    case "flag_urgent":
      return {
        success: true,
        flagged: true,
      };

    default:
      return {
        success: true,
        archived: true,
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

  const result = simulateExecution(toolCall.toolName);

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
      const result = simulateExecution(toolCall.toolName);

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
