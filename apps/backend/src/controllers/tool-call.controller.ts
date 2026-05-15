import { Request, Response } from "express";

import prisma from "../config/prisma";

import {
  executePendingToolCalls,
  executeSingleToolCall,
} from "../services/tool-executor.service";

export async function getToolCalls(_req: Request, res: Response) {
  try {
    const toolCalls = await prisma.toolCall.findMany({
      include: {
        email: true,
        execution: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: toolCalls.length,
      data: toolCalls,
    });
  } catch (error) {
    console.error("Failed fetching tool calls", error);

    return res.status(500).json({
      success: false,
      message: "Failed fetching tool calls",
    });
  }
}

export async function executeSingleTool(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const execution = await executeSingleToolCall(id);

    return res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (error) {
    console.error("Failed executing tool", error);

    return res.status(500).json({
      success: false,
      message: "Failed executing tool",
    });
  }
}

export async function executeTools(_req: Request, res: Response) {
  try {
    await executePendingToolCalls();

    return res.status(200).json({
      success: true,
      message: "Tool execution completed",
    });
  } catch (error) {
    console.error("Failed executing tools", error);

    return res.status(500).json({
      success: false,
      message: "Failed executing tools",
    });
  }
}
