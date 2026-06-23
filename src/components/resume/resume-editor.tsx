"use client";

import { useState, useCallback } from "react";
import { Upload, Plus, Trash2, Save } from "lucide-react";
import type { ResumeContent, ResumeSection } from "@/lib/types";
import { createEmptySection } from "@/lib/resume/sections";

interface Props {
  initialContent: ResumeContent;
}

export function ResumeEditor({ initialContent }: Props) {
  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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
    setContent((c) => ({
      ...c,
      [type]: [...c[type], createEmptySection(title)],
    }));
  };

  const removeSection = (
    type: "experience" | "education" | "customSections",
    id: string
  ) => {
    setContent((c) => ({
      ...c,
      [type]: c[type].filter((s) => s.id !== id),
    }));
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
      setMessage("Resume saved — this is now your active template.");
    } catch {
      setMessage("Failed to save resume.");
    } finally {
      setSaving(false);
    }
  }, [content]);

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
      setMessage("Resume uploaded and set as active template.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Resume Editor</h1>
          <p className="text-sm text-zinc-500">
            Upload a resume or edit sections below. Saving replaces your active resume.
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload resume"}
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save resume"}
          </button>
        </div>
      </div>

      {message && (
        <p className="rounded-md bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-900">
          {message}
        </p>
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

      <Section title="Summary">
        <textarea
          className="w-full rounded-md border border-zinc-300 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          rows={4}
          value={content.summary}
          onChange={(e) =>
            setContent((c) => ({ ...c, summary: e.target.value }))
          }
          placeholder="Professional summary…"
        />
      </Section>

      <SectionList
        title="Experience"
        sections={content.experience}
        onAdd={() => addSection("experience")}
        onUpdate={(id, field, value) =>
          updateSection("experience", id, field, value)
        }
        onRemove={(id) => removeSection("experience", id)}
      />

      <SectionList
        title="Education"
        sections={content.education}
        onAdd={() => addSection("education")}
        onUpdate={(id, field, value) =>
          updateSection("education", id, field, value)
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
              skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            }))
          }
          placeholder="JavaScript, React, Python…"
        />
      </Section>

      <SectionList
        title="Custom Sections"
        sections={content.customSections}
        onAdd={() => addSection("customSections")}
        onUpdate={(id, field, value) =>
          updateSection("customSections", id, field, value)
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
      <h2 className="mb-4 text-lg font-medium">{title}</h2>
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

function SectionList({
  title,
  sections,
  onAdd,
  onUpdate,
  onRemove,
}: {
  title: string;
  sections: ResumeSection[];
  onAdd: () => void;
  onUpdate: (id: string, field: "title" | "content", value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Section title={title}>
      <div className="space-y-4">
        {sections.map((s) => (
          <div
            key={s.id}
            className="rounded-md border border-zinc-100 p-4 dark:border-zinc-900"
          >
            <div className="mb-2 flex items-center gap-2">
              <input
                className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-950"
                value={s.title}
                onChange={(e) => onUpdate(s.id, "title", e.target.value)}
              />
              <button
                onClick={() => onRemove(s.id)}
                className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <textarea
              className="w-full rounded-md border border-zinc-300 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              rows={4}
              value={s.content}
              onChange={(e) => onUpdate(s.id, "content", e.target.value)}
            />
          </div>
        ))}
        <button
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
