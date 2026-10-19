import type { AllocateCodeParams, FormatCodeParams } from "../types/sequence-code.types";

export const DEFAULT_SEQUENCE_CODE_PAD = 6;

export function normalizeSequencePrefix(prefix: string) {
  const trimmed = prefix.trim();
  if (trimmed.length === 0) {
    throw new Error("Sequence prefix is required");
  }
  return trimmed.endsWith("-") ? trimmed : `${trimmed}-`;
}

export function formatCode(params: FormatCodeParams) {
  if (!Number.isInteger(params.sequence) || params.sequence < 1) {
    throw new Error("Sequence must be a positive integer");
  }
  const prefix = normalizeSequencePrefix(params.prefix);
  const pad = params.pad ?? DEFAULT_SEQUENCE_CODE_PAD;
  if (!Number.isInteger(pad) || pad < 1) {
    throw new Error("Pad must be a positive integer");
  }
  return `${prefix}${String(params.sequence).padStart(pad, "0")}`;
}

export async function allocateCode(params: AllocateCodeParams) {
  const sequence = await params.nextSequence();
  return formatCode({
    prefix: params.prefix,
    sequence,
    pad: params.pad ?? DEFAULT_SEQUENCE_CODE_PAD,
  });
}
