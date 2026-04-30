import { NextResponse } from "next/server";
import { runDiagnosis } from "@/lib/ai/provider";
import type { DiagnosisInput, IssueType } from "@/types/diagnosis";

export const maxDuration = 30;

const ISSUE_TYPES = new Set<IssueType>([
  "scanner",
  "receipt-printer",
  "pos",
  "network",
  "inventory-sync",
  "other",
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DiagnosisInput>;
    const language = body.language === "id" ? "id" : "en";

    if (!body.issueType || !ISSUE_TYPES.has(body.issueType)) {
      return NextResponse.json({ error: "A valid issueType is required." }, { status: 422 });
    }

    if (!body.symptoms || !body.symptoms.trim()) {
      return NextResponse.json({ error: "Symptoms are required." }, { status: 422 });
    }

    const diagnosis = await runDiagnosis({
      language,
      issueType: body.issueType,
      symptoms: body.symptoms.trim(),
      attemptedFixes: body.attemptedFixes?.trim() || "",
    });

    return NextResponse.json({ diagnosis });
  } catch {
    return NextResponse.json({ error: "Unable to process the diagnosis request." }, { status: 500 });
  }
}
