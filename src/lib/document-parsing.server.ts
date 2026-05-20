// Server-side document parsing for PDF, DOCX, TXT.
// Returns text grouped by logical "page" (real pages for PDF, single page for DOCX/TXT).

export type ParsedPage = { page: number; text: string };
export type ParsedDoc = { pages: ParsedPage[]; pageCount: number };

const MIME_PDF = "application/pdf";
const MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MIME_TXT = "text/plain";

export function isSupportedMime(mime: string) {
  return mime === MIME_PDF || mime === MIME_DOCX || mime === MIME_TXT;
}

export async function parseDocument(buffer: ArrayBuffer, mime: string): Promise<ParsedDoc> {
  if (mime === MIME_PDF) return parsePdf(buffer);
  if (mime === MIME_DOCX) return parseDocx(buffer);
  if (mime === MIME_TXT) return parseTxt(buffer);
  throw new Error(`Unsupported file type: ${mime}`);
}

async function parsePdf(buffer: ArrayBuffer): Promise<ParsedDoc> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const result = await extractText(pdf, { mergePages: false });
  const raw = result.text;
  const pageTexts: string[] = Array.isArray(raw) ? raw : [String(raw ?? "")];
  const pages: ParsedPage[] = pageTexts.map((t, i) => ({
    page: i + 1,
    text: normalize(t),
  }));
  return { pages, pageCount: pages.length };
}

async function parseDocx(buffer: ArrayBuffer): Promise<ParsedDoc> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({
    buffer: Buffer.from(buffer),
  } as never);
  const text = normalize(result.value || "");
  return { pages: [{ page: 1, text }], pageCount: 1 };
}

async function parseTxt(buffer: ArrayBuffer): Promise<ParsedDoc> {
  const text = normalize(new TextDecoder("utf-8").decode(buffer));
  return { pages: [{ page: 1, text }], pageCount: 1 };
}

function normalize(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/[\u00A0\u200B]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Chunk by characters with overlap. Returns { content, page, index } for each chunk.
export type Chunk = { content: string; page: number; index: number };

export function chunkPages(
  pages: ParsedPage[],
  { size = 1200, overlap = 180 }: { size?: number; overlap?: number } = {},
): Chunk[] {
  const chunks: Chunk[] = [];
  let idx = 0;
  for (const { page, text } of pages) {
    if (!text) continue;
    if (text.length <= size) {
      chunks.push({ content: text, page, index: idx++ });
      continue;
    }
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + size, text.length);
      let cut = end;
      if (end < text.length) {
        const slice = text.slice(start, end);
        const lastPara = slice.lastIndexOf("\n\n");
        const lastPeriod = slice.lastIndexOf(". ");
        const breakAt = Math.max(lastPara, lastPeriod);
        if (breakAt > size * 0.5) cut = start + breakAt + 1;
      }
      const content = text.slice(start, cut).trim();
      if (content.length > 0) chunks.push({ content, page, index: idx++ });
      if (cut >= text.length) break;
      start = Math.max(cut - overlap, start + 1);
    }
  }
  return chunks;
}
