import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function classifyEmail(
  subject: string,
  body: string,
) {
  const truncatedBody =
    body.slice(0, 4000);

  const prompt = `
You are an AI email triage assistant.

Analyze the email carefully and decide which tools should be used.

You may return MULTIPLE tools if needed.

Available actions:
- schedule_meeting
- draft_response
- escalate_to_manager
- create_task
- flag_urgent
- archive_no_action

Return ONLY valid JSON in this exact format:

{
  "toolCalls": [
    {
      "toolName": "create_task",
      "rationale": "Reason for choosing tool",
      "arguments": {
        "subject": "Task subject"
      }
    }
  ]
}

Rules:
- Always return at least one tool call
- Multiple tool calls are allowed
- Return ONLY valid JSON
- Do not include markdown

Email Subject:
${subject}

Email Body:
${truncatedBody}
`;

  try {
    const completion =
      await groq.chat.completions.create({
        model:
          "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a structured email triage AI.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      });

    const content =
      completion.choices[0]?.message
        ?.content;

    if (!content) {
      throw new Error(
        "Empty Groq response",
      );
    }

    try {
      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log(
        "RAW GROQ RESPONSE:",
        cleaned,
      );

      return JSON.parse(cleaned);
    } catch (error) {
      console.error(
        "Failed parsing Groq response:",
        content,
      );

      throw new Error(
        "Invalid JSON response from AI model",
      );
    }
  } catch (error: any) {
    console.error(
      "Groq API Error:",
      error,
    );

    const errorMessage =
      error?.message || "";

    if (
      errorMessage.includes("429") ||
      errorMessage.includes(
        "rate_limit_exceeded",
      ) ||
      errorMessage.includes(
        "Rate limit reached",
      )
    ) {
      throw new Error(
        "Groq API rate limit reached. Please retry later.",
      );
    }

    throw new Error(
      "Failed communicating with Groq AI service",
    );
  }
}