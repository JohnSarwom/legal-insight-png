import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { chunkPages, isSupportedMime, parseDocument } from "./document-parsing.server";
import { embedTexts } from "./embeddings.server";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

const createInput = z.object({
  filename: z.string().min(1).max(255),
  mime: z.string().min(1).max(200),
  size: z.number().int().positive().max(MAX_BYTES),
});

// Step 1 — register a pending document and return its id + storage path.
export const createDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createInput.parse(d))
  .handler(async ({ data, context }) => {
    if (!isSupportedMime(data.mime)) {
      throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
    }
    const { supabase, userId } = context;
    const id = crypto.randomUUID();
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
    const storage_path = `${userId}/${id}-${safeName}`;

    const { error } = await supabase.from("documents").insert({
      id,
      user_id: userId,
      filename: data.filename,
      mime_type: data.mime,
      size_bytes: data.size,
      storage_path,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { id, storage_path };
  });

// Step 2 — parse + chunk + embed + persist. Called after the client uploaded the file.
export const processDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // RLS ensures only the owner can read this row
    const { data: doc, error: fetchErr } = await supabase
      .from("documents")
      .select("id, user_id, storage_path, mime_type, status, filename")
      .eq("id", data.id)
      .single();
    if (fetchErr || !doc) throw new Error("Document not found");
    if (doc.user_id !== userId) throw new Error("Forbidden");
    if (doc.status === "ready" || doc.status === "processing") {
      return { id: doc.id, status: doc.status };
    }

    await supabaseAdmin
      .from("documents")
      .update({ status: "processing", error: null })
      .eq("id", doc.id);

    try {
      // Download from storage (admin bypasses RLS but path is already user-scoped)
      const { data: blob, error: dlErr } = await supabaseAdmin.storage
        .from("documents")
        .download(doc.storage_path);
      if (dlErr || !blob) throw new Error(dlErr?.message || "Failed to download upload");

      const buffer = await blob.arrayBuffer();
      const parsed = await parseDocument(buffer, doc.mime_type);
      const chunks = chunkPages(parsed.pages);
      if (chunks.length === 0) throw new Error("No extractable text found in document");

      // Embed in batches and insert
      const batchSize = 64;
      let inserted = 0;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const slice = chunks.slice(i, i + batchSize);
        const vectors = await embedTexts(slice.map((c) => c.content));
        const rows = slice.map((c, j) => ({
          document_id: doc.id,
          user_id: userId,
          chunk_index: c.index,
          page: c.page,
          content: c.content,
          embedding: vectors[j] as unknown as string,
        }));
        const { error: insErr } = await supabaseAdmin.from("document_chunks").insert(rows);
        if (insErr) throw new Error(insErr.message);
        inserted += rows.length;
      }

      await supabaseAdmin
        .from("documents")
        .update({
          status: "ready",
          chunk_count: inserted,
          page_count: parsed.pageCount,
        })
        .eq("id", doc.id);

      return { id: doc.id, status: "ready" as const, chunk_count: inserted };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Processing failed";
      await supabaseAdmin
        .from("documents")
        .update({ status: "failed", error: message })
        .eq("id", doc.id);
      throw new Error(message);
    }
  });

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("documents")
      .select("id, filename, mime_type, size_bytes, status, error, page_count, chunk_count, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { documents: data ?? [] };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: doc, error: fetchErr } = await supabase
      .from("documents")
      .select("id, storage_path, user_id")
      .eq("id", data.id)
      .single();
    if (fetchErr || !doc) throw new Error("Document not found");
    if (doc.user_id !== userId) throw new Error("Forbidden");

    await supabaseAdmin.storage.from("documents").remove([doc.storage_path]);
    const { error } = await supabaseAdmin.from("documents").delete().eq("id", doc.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
