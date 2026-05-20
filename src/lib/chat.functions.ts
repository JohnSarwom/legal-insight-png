import { createServerFn } from "@tanstack/react-start";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway";

const SYSTEM_PROMPT = `You are PNG Legal AI, an expert legal research assistant for Papua New Guinea.

Guidelines:
- Provide clear, well-structured legal analysis grounded in PNG law (the Constitution, Acts of Parliament, case law, and Underlying Law where relevant).
- Cite specific statutes, sections, and cases when known. If you are not certain of a citation, say so explicitly rather than fabricating it.
- Distinguish between (a) settled law, (b) reasoned interpretation, and (c) practical guidance.
- When the user's question is ambiguous, ask one focused clarifying question before answering.
- Always include a short disclaimer that this is general legal information, not legal advice, and recommend consulting a qualified PNG lawyer for matter-specific questions.
- Format responses in clean markdown with headings, bullet lists, and short paragraphs.`;

export const streamChat = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: UIMessage[] }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured.");
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(data.messages),
    });

    return result.toUIMessageStreamResponse({ originalMessages: data.messages });
  });
