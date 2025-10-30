declare module "pdf-parse" {
  import type { Buffer } from "buffer";

  export interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown> | null;
    text: string;
    version: string;
  }

  export default function pdf(
    dataBuffer: Buffer | Uint8Array,
    options?: Record<string, unknown>
  ): Promise<PDFParseResult>;
}

declare module "mammoth" {
  export interface MammothResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  export function extractRawText(options: {
    arrayBuffer?: ArrayBuffer;
    buffer?: ArrayBuffer;
    path?: string;
  }): Promise<MammothResult>;
}
