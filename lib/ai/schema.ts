import type {
  AiRuntime,
  DiagnosisInput,
  DiagnosisResult,
  DiagnosisStep,
  SessionSummary,
  StoredSession,
} from "@/types/diagnosis";

const ISSUE_TYPES = new Set([
  "scanner",
  "receipt-printer",
  "pos",
  "network",
  "inventory-sync",
  "other",
]);

const SEVERITIES = new Set(["low", "medium", "high", "critical"]);

function isIssueType(value: unknown): value is DiagnosisInput["issueType"] {
  return typeof value === "string" && ISSUE_TYPES.has(value);
}

function isSeverity(value: unknown): value is DiagnosisResult["severity"] {
  return typeof value === "string" && SEVERITIES.has(value);
}

function parseJsonBlock(payload: string): unknown {
  const trimmed = payload.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(withoutFence);
}

function runtimeFromRecord(record: Record<string, unknown>, fallback: AiRuntime): AiRuntime {
  const runtime =
    typeof record.runtime === "object" && record.runtime
      ? (record.runtime as Record<string, unknown>)
      : null;

  if (!runtime) {
    return fallback;
  }

  const provider =
    runtime.provider === "openai" || runtime.provider === "openrouter" || runtime.provider === "fallback"
      ? runtime.provider
      : fallback.provider;

  const mode = runtime.mode === "live" || runtime.mode === "fallback" ? runtime.mode : fallback.mode;
  const model = typeof runtime.model === "string" && runtime.model ? runtime.model : fallback.model;

  return { provider, mode, model };
}

function toStep(step: unknown, index: number): DiagnosisStep {
  const record = typeof step === "object" && step ? (step as Record<string, unknown>) : {};

  return {
    id: typeof record.id === "string" && record.id.length > 0 ? record.id : `step-${index + 1}`,
    title: typeof record.title === "string" ? record.title : `Step ${index + 1}`,
    instruction:
      typeof record.instruction === "string" ? record.instruction : "Inspect the related device state.",
    expectedResult:
      typeof record.expectedResult === "string"
        ? record.expectedResult
        : "The device should respond normally.",
    whyItMatters:
      typeof record.whyItMatters === "string"
        ? record.whyItMatters
        : "This narrows down the likely cause.",
  };
}

export function normalizeDiagnosis(
  input: DiagnosisInput,
  payload: string,
  fallbackRuntime: AiRuntime,
): DiagnosisResult {
  const id = input.language === "id";
  const parsed = parseJsonBlock(payload);
  const record = typeof parsed === "object" && parsed ? (parsed as Record<string, unknown>) : {};
  const steps = Array.isArray(record.steps) ? record.steps.map(toStep) : [];

  return {
    agentName: typeof record.agentName === "string" ? record.agentName : "Akari",
    mission:
      typeof record.mission === "string"
        ? record.mission
        : id
          ? "Telusuri masalah, kurangi tebak-tebakan, dan arahkan langkah berikutnya."
          : "Trace the fault, reduce guesswork, and guide the next move.",
    issueType: isIssueType(record.issueType) ? record.issueType : input.issueType,
    severity: isSeverity(record.severity) ? record.severity : "medium",
    confidence:
      typeof record.confidence === "number"
        ? Math.min(1, Math.max(0, record.confidence))
        : 0.75,
    summary:
      typeof record.summary === "string"
        ? record.summary
        : id
          ? "Masalah ini kemungkinan disebabkan oleh ketidaksesuaian konfigurasi atau konektivitas."
          : "The issue is likely caused by a configuration or connectivity mismatch.",
    probableCauses: Array.isArray(record.probableCauses)
      ? record.probableCauses.filter((entry): entry is string => typeof entry === "string")
      : [],
    nextAction:
      typeof record.nextAction === "string"
        ? record.nextAction
        : id
          ? "Jalankan langkah troubleshooting pertama dan konfirmasi hasilnya."
          : "Run the first troubleshooting step and confirm the result.",
    escalationNeeded: Boolean(record.escalationNeeded),
    recommendedProducts: Array.isArray(record.recommendedProducts)
      ? record.recommendedProducts.filter((entry): entry is string => typeof entry === "string")
      : [],
    recommendedServiceAction:
      typeof record.recommendedServiceAction === "string"
        ? record.recommendedServiceAction
        : null,
    steps,
    runtime: runtimeFromRecord(record, fallbackRuntime),
  };
}

export function normalizeSummary(
  session: StoredSession,
  payload: string,
  fallbackRuntime: AiRuntime,
): SessionSummary {
  const id = session.language === "id";
  const parsed = parseJsonBlock(payload);
  const record = typeof parsed === "object" && parsed ? (parsed as Record<string, unknown>) : {};
  const packet =
    typeof record.supportPacket === "object" && record.supportPacket
      ? (record.supportPacket as Record<string, unknown>)
      : {};

  return {
    headline:
      typeof record.headline === "string"
        ? record.headline
        : id
          ? "Handoff support siap"
          : "Support handoff ready",
    overview:
      typeof record.overview === "string"
        ? record.overview
        : id
          ? "Pengguna telah menyelesaikan diagnosis awal dan memerlukan langkah berikutnya yang jelas."
          : "The user has completed the first diagnosis pass and needs a clear next action.",
    recommendedHandoff:
      typeof record.recommendedHandoff === "string"
        ? record.recommendedHandoff
        : id
          ? "Arahkan ke spesialis support yang menangani troubleshooting perangkat."
          : "Route to a support specialist who handles device troubleshooting.",
    runtime: runtimeFromRecord(record, fallbackRuntime),
    supportPacket: {
      category: session.issueType,
      severity: session.diagnosis?.severity ?? "medium",
      customerStory:
        typeof packet.customerStory === "string" ? packet.customerStory : session.symptoms,
      attemptedFixes:
        typeof packet.attemptedFixes === "string"
          ? packet.attemptedFixes
          : session.attemptedFixes || (id ? "Belum ada perbaikan manual yang tercatat." : "No manual fixes recorded."),
      nextBestAction:
        typeof packet.nextBestAction === "string"
          ? packet.nextBestAction
          : session.diagnosis?.nextAction ??
            (id ? "Tinjau hasil troubleshooting yang sudah dicatat." : "Review the captured troubleshooting results."),
    },
  };
}
