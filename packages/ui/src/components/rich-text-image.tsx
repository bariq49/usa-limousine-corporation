"use client";

import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

export function RichTextImage(props: NodeViewProps) {
  const { node, selected, deleteNode, editor } = props;
  const src = String(node.attrs["src"] ?? "");
  const alt = String(node.attrs["alt"] ?? "");
  const title = String(node.attrs["title"] ?? "");
  const canEdit = editor.isEditable;

  return (
    <NodeViewWrapper
      as="figure"
      className={cn(
        "rich-text-image group relative my-4 overflow-hidden rounded-md",
        selected && "ring-2 ring-primary ring-offset-2",
      )}
      data-drag-handle
    >
      <img src={src} alt={alt} title={title || undefined} className="m-0 block h-auto w-full" />
      {canEdit ? (
        <button
          type="button"
          title="Remove image"
          aria-label="Remove image"
          contentEditable={false}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            deleteNode();
          }}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-default-700 shadow-md transition hover:bg-destructive hover:text-white"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>
      ) : null}
    </NodeViewWrapper>
  );
}
