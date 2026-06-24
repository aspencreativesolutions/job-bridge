"use client";

import { useCallback, useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing…",
  minHeight = "120px",
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || el.innerHTML === value) return;
    el.innerHTML = value || "";
  }, [value]);

  const sync = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    onChange(el.innerHTML);
  }, [onChange]);

  function exec(command: string) {
    document.execCommand(command, false);
    editorRef.current?.focus();
    sync();
  }

  return (
    <div className="overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
      <div className="flex gap-1 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
        <ToolbarButton
          label="Bold"
          onClick={() => exec("bold")}
          icon={<Bold className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Italic"
          onClick={() => exec("italic")}
          icon={<Italic className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Bullet list"
          onClick={() => exec("insertUnorderedList")}
          icon={<List className="h-4 w-4" />}
        />
        <ToolbarButton
          label="Numbered list"
          onClick={() => exec("insertOrderedList")}
          icon={<ListOrdered className="h-4 w-4" />}
        />
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        data-placeholder={placeholder}
        className="min-w-0 px-3 py-2 text-sm outline-none empty:before:text-zinc-400 empty:before:content-[attr(data-placeholder)] dark:bg-zinc-950"
        style={{ minHeight }}
      />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {icon}
    </button>
  );
}

export function RichTextPreview({ html }: { html: string }) {
  if (!html.trim()) {
    return (
      <p className="text-sm italic text-zinc-400">No content yet. Click Edit to add.</p>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none text-zinc-700 dark:prose-invert dark:text-zinc-300 [&_li]:my-0.5 [&_p]:my-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
