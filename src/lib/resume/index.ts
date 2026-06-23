import { v4 as uuidv4 } from "uuid";
import { DEFAULT_RESUME, type ResumeContent } from "../types";

export function parseResumeContent(raw: string): ResumeContent {
  try {
    const parsed = JSON.parse(raw) as ResumeContent;
    return {
      ...DEFAULT_RESUME,
      ...parsed,
      contact: { ...DEFAULT_RESUME.contact, ...parsed.contact },
    };
  } catch {
    return { ...DEFAULT_RESUME };
  }
}

export function serializeResumeContent(content: ResumeContent): string {
  return JSON.stringify(content);
}

export function textToResumeContent(text: string): ResumeContent {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const content: ResumeContent = {
    ...DEFAULT_RESUME,
    summary: lines.slice(0, 3).join(" "),
    experience: [
      {
        id: uuidv4(),
        title: "Experience (from upload)",
        content: text.slice(0, 2000),
      },
    ],
  };
  return content;
}
