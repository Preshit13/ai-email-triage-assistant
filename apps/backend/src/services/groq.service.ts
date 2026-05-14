import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function classifyEmail(subject: string, body: string) {
  const prompt = `
You are an AI email triage assistant.

Analyze the email and decide the best action.

Available actions:
- schedule_meeting
- draft_response
- escalate_to_manager
- create_task
- flag_urgent
- archive_no_action

Return ONLY valid JSON in this exact format:

{
  "toolName": "create_task",
  "rationale": "Reason for choosing tool"
}

Email Subject:
${subject}

Email Body:
${body}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a structured email triage AI.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty Groq response");
  }

  try {
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    console.log("RAW GROQ RESPONSE:", cleaned);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed parsing Groq response:", content);

    throw new Error("Invalid JSON response");
  }
}
