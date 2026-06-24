import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { parseResumeContent } from "@/lib/resume";
import { isResumeEmpty } from "@/lib/resume/linkedin-import";
import { DEFAULT_RESUME } from "@/lib/types";
import { ResumeEditor } from "@/components/resume/resume-editor";
import { hasLinkedInAccount } from "@/lib/linkedin/store";

export default async function ResumePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const linkedInConnected = await hasLinkedInAccount(session.user.id);

  let resume = await db.resume.findUnique({
    where: { userId: session.user.id },
  });

  if (!resume) {
    resume = await db.resume.create({
      data: {
        userId: session.user.id,
        content: JSON.stringify(DEFAULT_RESUME),
      },
    });
  }

  const content = parseResumeContent(resume.content);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ResumeEditor
        initialContent={content}
        hasLinkedInAccount={linkedInConnected}
        autoImportLinkedIn={linkedInConnected && isResumeEmpty(content)}
      />
    </div>
  );
}
