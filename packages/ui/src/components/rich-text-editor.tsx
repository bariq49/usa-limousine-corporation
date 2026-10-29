"use client";

import { useEffect, useRef, type ComponentType, type SVGProps } from "react";
import { EditorContent, ReactNodeViewRenderer, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Minus,
  Redo,
  Strikethrough,
  TextQuote,
  Underline,
  Undo,
} from "../svg";
import { cn } from "../utils/cn";
import { RichTextImage } from "./rich-text-image";

const EditorImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(RichTextImage);
  },
});

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onUploadImage?: ((file: File) => Promise<string>) | undefined;
  placeholder?: string | undefined;
  hasError?: boolean | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
};

type ToolbarButton = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  onClick: () => void;
};

export function RichTextEditor({
  value,
  onChange,
  onUploadImage,
  placeholder = "Write your article...",
  hasError,
  disabled,
  className,
}: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      EditorImage,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "rich-content min-h-80 px-4 py-3 text-default-800 focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? "" : current.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      underline: current?.isActive("underline") ?? false,
      strike: current?.isActive("strike") ?? false,
      h2: current?.isActive("heading", { level: 2 }) ?? false,
      h3: current?.isActive("heading", { level: 3 }) ?? false,
      bullet: current?.isActive("bulletList") ?? false,
      ordered: current?.isActive("orderedList") ?? false,
      quote: current?.isActive("blockquote") ?? false,
      link: current?.isActive("link") ?? false,
      canUndo: current?.can().undo() ?? false,
      canRedo: current?.can().redo() ?? false,
    }),
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value === current) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || editor.isDestroyed) return;
      const next = editor.isEmpty ? "" : editor.getHTML();
      if (value !== next) {
        editor.commands.setContent(value || "", { emitUpdate: false });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [editor, value]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.isEditable === !disabled) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || editor.isDestroyed) return;
      if (editor.isEditable !== !disabled) {
        editor.setEditable(!disabled);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [editor, disabled]);

  const chain = () => editor?.chain().focus();

  const setLink = () => {
    if (!editor) return;
    const previous = (editor.getAttributes("link")["href"] as string | undefined) ?? "";
    const url = window.prompt("Link URL", previous);
    if (url === null) return;
    if (url.trim() === "") {
      chain()?.extendMarkRange("link").unsetLink().run();
      return;
    }
    chain()?.extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const imageButton: ToolbarButton[] = onUploadImage
    ? [{ label: "Image", icon: ImagePlus, onClick: () => fileRef.current?.click() }]
    : [];

  const toolbar: (ToolbarButton | "divider")[] = [
    {
      label: "Heading",
      icon: Heading2,
      active: state?.h2,
      onClick: () => chain()?.toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Subheading",
      icon: Heading3,
      active: state?.h3,
      onClick: () => chain()?.toggleHeading({ level: 3 }).run(),
    },
    "divider",
    { label: "Bold", icon: Bold, active: state?.bold, onClick: () => chain()?.toggleBold().run() },
    {
      label: "Italic",
      icon: Italic,
      active: state?.italic,
      onClick: () => chain()?.toggleItalic().run(),
    },
    {
      label: "Underline",
      icon: Underline,
      active: state?.underline,
      onClick: () => chain()?.toggleUnderline().run(),
    },
    {
      label: "Strikethrough",
      icon: Strikethrough,
      active: state?.strike,
      onClick: () => chain()?.toggleStrike().run(),
    },
    "divider",
    {
      label: "Bulleted list",
      icon: List,
      active: state?.bullet,
      onClick: () => chain()?.toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: state?.ordered,
      onClick: () => chain()?.toggleOrderedList().run(),
    },
    {
      label: "Quote",
      icon: TextQuote,
      active: state?.quote,
      onClick: () => chain()?.toggleBlockquote().run(),
    },
    { label: "Divider", icon: Minus, onClick: () => chain()?.setHorizontalRule().run() },
    "divider",
    { label: "Link", icon: LinkIcon, active: state?.link, onClick: setLink },
  ];

  const buttons = toolbar.concat(imageButton, [
    "divider",
    { label: "Undo", icon: Undo, disabled: !state?.canUndo, onClick: () => chain()?.undo().run() },
    { label: "Redo", icon: Redo, disabled: !state?.canRedo, onClick: () => chain()?.redo().run() },
  ]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-card",
        hasError && "border-destructive",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-default-50 px-2 py-1.5">
        {buttons.map((button, index) =>
          button === "divider" ? (
            <span key={`divider-${index}`} className="mx-1 h-5 w-px bg-border" />
          ) : (
            <button
              key={button.label}
              type="button"
              title={button.label}
              aria-label={button.label}
              aria-pressed={button.active ?? false}
              disabled={disabled || button.disabled || !editor}
              onClick={button.onClick}
              className={cn(
                "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-default-600 transition hover:bg-default-200 hover:text-default-900 disabled:cursor-not-allowed disabled:opacity-40",
                button.active &&
                  "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary",
              )}
            >
              <button.icon className="h-4 w-4" />
            </button>
          ),
        )}
      </div>
      <EditorContent editor={editor} />
      {onUploadImage ? (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file || !editor) return;
            const src = await onUploadImage(file);
            if (src)
              chain()
                ?.setImage({ src, alt: file.name.replace(/\.[^.]+$/, "") })
                .run();
          }}
        />
      ) : null}
    </div>
  );
}
