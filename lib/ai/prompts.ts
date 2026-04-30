import type { DiagnosisInput, StoredSession } from "@/types/diagnosis";

type PromptMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function buildDiagnosisMessages(input: DiagnosisInput): PromptMessage[] {
  const responseLanguage = input.language === "id" ? "Indonesian" : "English";

  return [
    {
      role: "system",
      content: [
        "You are Akari, an original anime-inspired operations guide for retail systems.",
        "Speak with calm, direct, high-clarity language.",
        `Respond in ${responseLanguage}.`,
        "Return JSON only.",
        "Focus on diagnosis, step-by-step troubleshooting, and whether escalation is necessary.",
        "Anchor every field to the user's exact symptom and attempted fixes. Do not give a reusable template answer.",
        "Avoid generic lines like 'operational fault' or 'check hardware and connection' unless the symptom clearly points there.",
        "If the user mentions stock mismatch, sync delay, barcode input, cashier field focus, paper jam, printer target, offline network, or POS freeze, reference that cue explicitly in the summary and causes.",
        "The summary must sound specific to this case, not interchangeable with another issue.",
        "List 2 to 4 probable causes in priority order.",
        "Make the steps practical and concrete for the named device or workflow.",
        "Use this exact shape:",
        JSON.stringify({
          agentName: "Akari",
          mission: "Short mission line",
          issueType: "scanner",
          severity: "medium",
          confidence: 0.84,
          summary: "One short summary",
          probableCauses: ["Cause one", "Cause two"],
          nextAction: "One concrete next action",
          escalationNeeded: false,
          recommendedProducts: ["Optional item"],
          recommendedServiceAction: "Optional service action",
          steps: [
            {
              id: "step-1",
              title: "Check cable",
              instruction: "What the user should do",
              expectedResult: "What should happen",
              whyItMatters: "Why this step matters"
            }
          ]
        }),
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(input),
    },
  ];
}

export function buildSummaryMessages(session: StoredSession): PromptMessage[] {
  const responseLanguage = session.language === "id" ? "Indonesian" : "English";

  return [
    {
      role: "system",
      content: [
        "You are Akari, generating a handoff summary for a human support agent.",
        `Respond in ${responseLanguage}.`,
        "Return JSON only.",
        "Keep the summary practical and compact.",
        "Reflect the actual symptom, not a generic support wrap-up.",
        "The headline and overview must preserve the specific failure theme, such as stock sync, scanner input, printer output, or network connectivity.",
        "The nextBestAction should be different when the issue is different.",
        "Use this exact shape:",
        JSON.stringify({
          headline: "One short headline",
          overview: "A compact support summary",
          recommendedHandoff: "Who should handle this and why",
          runtime: {
            provider: "openai",
            mode: "live",
            model: "gpt-4.1-mini"
          },
          supportPacket: {
            category: "scanner",
            severity: "high",
            customerStory: "What happened",
            attemptedFixes: "What has already been tried",
            nextBestAction: "What support should do next"
          }
        }),
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(session),
    },
  ];
}
