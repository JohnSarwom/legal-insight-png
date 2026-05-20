import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { embedQuery } from "@/lib/embeddings.server";
import type { Database } from "@/integrations/supabase/types";

const BASE_SYSTEM_PROMPT = `You are PNG Legal AI, an expert legal research assistant for Papua New Guinea.

Guidelines:
- Provide clear, well-structured legal analysis grounded in PNG law (the Constitution, Acts of Parliament, case law, and Underlying Law where relevant).
- Cite specific statutes, sections, and cases when known. If you are not certain of a citation, say so explicitly rather than fabricating it.
- Distinguish between (a) settled law, (b) reasoned interpretation, and (c) practical guidance.
- When the user's question is ambiguous, ask one focused clarifying question before answering.
- Always include a short disclaimer that this is general legal information, not legal advice, and recommend consulting a qualified PNG lawyer for matter-specific questions.
- Format responses in clean markdown with headings, bullet lists, and short paragraphs.`;

const RAG_INSTRUCTIONS = `You have been given excerpts from the user's uploaded documents under "<knowledge>". Ground your answer in these excerpts whenever they are relevant. After every claim that uses a source, append an inline citation like \`[S1]\`, \`[S2]\` etc., matching the source number. If the answer is not supported by the excerpts, say so and answer from general PNG legal knowledge while making clear it is not from the user's documents. At the end, list all cited sources under a "Sources" heading as "[S1] filename — p.N".`;

type ChatBody = { messages?: unknown; documentIds?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as ChatBody;
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("messages is required", { status: 400 });
        }
        const documentIds = Array.isArray(body.documentIds)
          ? (body.documentIds as unknown[]).filter((x): x is string => typeof x === "string")
          : [];

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response("LOVABLE_API_KEY is not configured", { status: 500 });
        }

        const uiMessages = messages as UIMessage[];

        // Build optional knowledge context from the user's last message
        let knowledgeBlock = "";
        if (documentIds.length > 0) {
          try {
            knowledgeBlock = await buildKnowledgeBlock(
              request,
              uiMessages,
              documentIds,
            );
          } catch (e) {
            console.error("RAG retrieval failed:", e);
            // Fall through — answer without RAG rather than erroring the stream
          }
        }

        const gateway = createLovableAiGatewayProvider(apiKey);
        const model = gateway("google/gemini-3-flash-preview");

        const system = knowledgeBlock
          ? `${BASE_SYSTEM_PROMPT}\n\n${RAG_INSTRUCTIONS}\n\n<knowledge>\n${knowledgeBlock}\n</knowledge>`
          : BASE_SYSTEM_PROMPT;

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(uiMessages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: uiMessages });
      },
    },
  },
});

async function buildKnowledgeBlock(
  request: Request,
  uiMessages: UIMessage[],
  documentIds: string[],
): Promise<string> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return "";

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return "";

  const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");
  if (!lastUser) return "";
  const query = lastUser.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!query) return "";

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });

  const embedding = await embedQuery(query);
  const { data, error } = await supabase.rpc("match_document_chunks" as never, {
    query_embedding: embedding as unknown as string,
    doc_ids: documentIds,
    match_count: 6,
  } as never);
  if (error || !Array.isArray(data)) return "";

  const matches = data as Array<{
    filename: string;
    page: number | null;
    content: string;
    similarity: number;
  }>;

  return matches
    .map((m, i) => {
      const cite = `[S${i + 1}] ${m.filename}${m.page ? ` — p.${m.page}` : ""}`;
      return `${cite}\n${m.content.trim()}`;
    })
    .join("\n\n---\n\n");
}
