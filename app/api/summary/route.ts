import { NextResponse } from "next/server";
import { runSummary } from "@/lib/ai/provider";
import type { StoredSession } from "@/types/diagnosis";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<StoredSession>;

    if (!body.id || !body.issueType || !body.symptoms || !body.diagnosis) {
      return NextResponse.json({ error: "A completed diagnosis session is required." }, { status: 422 });
    }

    const session = {
      ...body,
      language: body.language === "id" ? "id" : "en",
    } as StoredSession;
    const summary = await runSummary(session);

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: "Unable to build the summary." }, { status: 500 });
  }
}
