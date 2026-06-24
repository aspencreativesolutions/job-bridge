"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  Plus,
  Trash2,
  Save,
  Pencil,
  Check,
  Link2,
  Loader2,
} from "lucide-react";
import type { ResumeContent, ResumeSection } from "@/lib/types";
import { createEmptySection } from "@/lib/resume/sections";
import { isResumeEmpty } from "@/lib/resume/linkedin-import";
import { RichTextEditor, RichTextPreview } from "./rich-text-editor";

interface Props {
  initialContent: ResumeContent;
  hasLinkedInAccount: boolean;
  autoImportLinkedIn?: boolean;
}

export function ResumeEditor({
  initialContent,
  hasLinkedInAccount,
  autoImportLinkedIn = false,
}: Props) {
  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSummary, setEditingSummary] = useState(false);
  const [showManualPrompt, setShowManualPrompt] = useState(
    isResumeEmpty(initialContent)
  );

  const updateContact = (field: keyof ResumeContent["contact"], value: string) => {
    setContent((c) => ({
      ...c,
      contact: { ...c.contact, [field]: value },
    }));
  };

  const updateSection = (
    type: "experience" | "education" | "customSections",
    id: string,
    field: "title" | "content",
    value: string
  ) => {
    setContent((c) => ({
      ...c,
      [type]: c[type].map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  const addSection = (type: "experience" | "education" | "customSections") => {
    const title =
      type === "experience"
        ? "New Role"
        : type === "education"
          ? "New Education"
          : "Custom Section";
    const section = createEmptySection(title);
    setContent((c) => ({
      ...c,
      [type]: [...c[type], section],
    }));
    setEditingId(section.id);
    setShowManualPrompt(false);
  };

  const removeSection = (
    type: "experience" | "education" | "customSections",
    id: string
  ) => {
    setContent((c) => ({
      ...c,
      [type]: c[type].filter((s) => s.id !== id),
    }));
    if (editingId === id) setEditingId(null);
  };

  const save = useCallback(async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage(
        "Resume saved — this is now your default resume for job applications."
      );
      setShowManualPrompt(false);
    } catch {
      setMessage("Failed to save resume.");
    } finally {
      setSaving(false);
    }
  }, [content]);

  async function importFromLinkedIn() {
    setImporting(true);
    setMessage("");
    setWarnings([]);
    try {
      const res = await fetch("/api/resume/import-linkedin", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");

      setContent(data.content);
      setWarnings(data.warnings ?? []);
      setShowManualPrompt(!data.imported);
      setEditingId(null);
      setEditingSummary(false);

      setMessage(
        data.imported
          ? "Imported from LinkedIn. Review each section, edit as needed, then save."
          : "LinkedIn returned limited data. Fill in sections manually, then save."
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContent(data.content);
      setShowManualPrompt(false);
      setMessage("Resume uploaded and set as your default template.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (autoImportLinkedIn) {
      importFromLinkedIn();
    }
  }, [autoImportLinkedIn]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Resume Editor</h1>
          <p className="text-sm text-zinc-500">
            Import from LinkedIn, edit each section, and save as your default
            application resume.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasLinkedInAccount && (
            <button
              type="button"
              onClick={importFromLinkedIn}
              disabled={importing}
              className="flex items-center gap-2 rounded-md bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white hover:bg-[#004182] disabled:opacity-50"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              {importing ? "Importing…" : "Import from LinkedIn"}
            </button>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload file"}
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save resume"}
          </button>
        </div>
      </div>

      {showManualPrompt && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          {hasLinkedInAccount
            ? "No LinkedIn resume data was found. Fill in each section below, use Edit on any section to customize, then click Save resume."
            : "Connect LinkedIn from the dashboard to import your profile, or fill in sections manually below."}
        </div>
      )}

      {message && (
        <p className="rounded-md bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-900">
          {message}
        </p>
      )}

      {warnings.length > 0 && (
        <div className="space-y-1 rounded-md bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          {warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      )}

      <Section title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            ["name", "email", "phone", "location", "linkedin"] as const
          ).map((field) => (
            <Field
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={content.contact[field]}
              onChange={(v) => updateContact(field, v)}
            />
          ))}
        </div>
      </Section>

      <EditableBlock
        title="Summary"
        editing={editingSummary}
        onEdit={() => setEditingSummary(true)}
        onDone={() => setEditingSummary(false)}
      >
        {editingSummary ? (
          <RichTextEditor
            value={content.summary}
            onChange={(html) => setContent((c) => ({ ...c, summary: html }))}
            placeholder="Professional summary…"
            minHeight="100px"
          />
        ) : (
          <RichTextPreview html={content.summary} />
        )}
      </EditableBlock>

      <EditableSectionList
        title="Experience"
        sections={content.experience}
        editingId={editingId}
        onEdit={setEditingId}
        onAdd={() => addSection("experience")}
        onUpdateTitle={(id, value) =>
          updateSection("experience", id, "title", value)
        }
        onUpdateContent={(id, value) =>
          updateSection("experience", id, "content", value)
        }
        onRemove={(id) => removeSection("experience", id)}
      />

      <EditableSectionList
        title="Education"
        sections={content.education}
        editingId={editingId}
        onEdit={setEditingId}
        onAdd={() => addSection("education")}
        onUpdateTitle={(id, value) =>
          updateSection("education", id, "title", value)
        }
        onUpdateContent={(id, value) =>
          updateSection("education", id, "content", value)
        }
        onRemove={(id) => removeSection("education", id)}
      />

      <Section title="Skills">
        <textarea
          className="w-full rounded-md border border-zinc-300 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          rows={3}
          value={content.skills.join(", ")}
          onChange={(e) =>
            setContent((c) => ({
              ...c,
              skills: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }))
          }
          placeholder="JavaScript, React, Python…"
        />
        <p className="mt-1 text-xs text-zinc-500">Comma-separated</p>
      </Section>

      <EditableSectionList
        title="Custom Sections"
        sections={content.customSections}
        editingId={editingId}
        onEdit={setEditingId}
        onAdd={() => addSection("customSections")}
        onUpdateTitle={(id, value) =>
          updateSection("customSections", id, "title", value)
        }
        onUpdateContent={(id, value) =>
          updateSection("customSections", id, "content", value)
        }
        onRemove={(id) => removeSection("customSections", id)}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
      <h2 className="section-title mb-4">{title}</h2>
      {children}
    </section>
  );
}

function EditableBlock({
  title,
  editing,
  onEdit,
  onDone,
  children,
}: {
  title: string;
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="section-title">{title}</h2>
        {editing ? (
          <button
            type="button"
            onClick={onDone}
            className="flex items-center gap-1 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            <Check className="h-3.5 w-3.5" />
            Done
          </button>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-zinc-500">{label}</span>
      <input
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function EditableSectionList({
  title,
  sections,
  editingId,
  onEdit,
  onAdd,
  onUpdateTitle,
  onUpdateContent,
  onRemove,
}: {
  title: string;
  sections: ResumeSection[];
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onAdd: () => void;
  onUpdateTitle: (id: string, value: string) => void;
  onUpdateContent: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Section title={title}>
      <div className="space-y-4">
        {sections.length === 0 && (
          <p className="text-sm italic text-zinc-400">
            No entries yet. Add one below or import from LinkedIn.
          </p>
        )}
        {sections.map((s) => {
          const editing = editingId === s.id;
          return (
            <div
              key={s.id}
              className="rounded-md border border-zinc-100 p-4 dark:border-zinc-900"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <input
                  className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-950"
                  value={s.title}
                  onChange={(e) => onUpdateTitle(s.id, e.target.value)}
                  placeholder="Section title"
                />
                {editing ? (
                  <button
                    type="button"
                    onClick={() => onEdit(null)}
                    className="flex items-center gap-1 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Done
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onEdit(s.id)}
                    className="flex items-center gap-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(s.id)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {editing ? (
                <RichTextEditor
                  value={s.content}
                  onChange={(html) => onUpdateContent(s.id, html)}
                  placeholder="Describe this role or degree…"
                />
              ) : (
                <RichTextPreview html={s.content} />
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
        >
          <Plus className="h-4 w-4" />
          Add {title.toLowerCase()} entry
        </button>
      </div>
    </Section>
  );
}
