import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeResumeContent } from "@/lib/resume";
import {
  extractTextFromFile,
  textToResumeContent,
} from "@/lib/resume/parse-upload";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractTextFromFile(buffer, file.name);
  const content = textToResumeContent(text);

  const existing = await db.resume.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) {
    await db.resumeVersion.create({
      data: {
        resumeId: existing.id,
        content: existing.content,
        label: `Before upload: ${file.name}`,
      },
    });
  }

  const resume = await db.resume.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      content: serializeResumeContent(content),
      fileName: file.name,
    },
    update: {
      content: serializeResumeContent(content),
      fileName: file.name,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({
    ...resume,
    content,
    message: "Resume uploaded and set as active template",
  });
}
