import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseResumeContent, serializeResumeContent } from "@/lib/resume";
import { DEFAULT_RESUME } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let resume = await db.resume.findUnique({
    where: { userId: session.user.id },
  });

  if (!resume) {
    resume = await db.resume.create({
      data: {
        userId: session.user.id,
        content: serializeResumeContent(DEFAULT_RESUME),
      },
    });
  }

  return NextResponse.json({
    ...resume,
    content: parseResumeContent(resume.content),
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const content = serializeResumeContent(body.content);

  const existing = await db.resume.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) {
    await db.resumeVersion.create({
      data: {
        resumeId: existing.id,
        content: existing.content,
        label: `Saved ${new Date().toLocaleString()}`,
      },
    });
  }

  const resume = await db.resume.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      content,
    },
    update: { content, isActive: true, updatedAt: new Date() },
  });

  return NextResponse.json({
    ...resume,
    content: parseResumeContent(resume.content),
  });
}
