export type IssueType =
  | "scanner"
  | "receipt-printer"
  | "pos"
  | "network"
  | "inventory-sync"
  | "other";

export type Severity = "low" | "medium" | "high" | "critical";

export type StepStatus = "pending" | "passed" | "failed";
export type AppLanguage = "en" | "id";

export type AiProvider = "openai" | "openrouter" | "fallback";

export interface AiRuntime {
  provider: AiProvider;
  mode: "live" | "fallback";
  model: string;
}

export interface DiagnosisStep {
  id: string;
  title: string;
  instruction: string;
  expectedResult: string;
  whyItMatters: string;
}

export interface DiagnosisResult {
  agentName: string;
  mission: string;
  issueType: IssueType;
  severity: Severity;
  confidence: number;
  summary: string;
  probableCauses: string[];
  nextAction: string;
  escalationNeeded: boolean;
  recommendedProducts: string[];
  recommendedServiceAction: string | null;
  steps: DiagnosisStep[];
  runtime: AiRuntime;
}

export interface SessionSummary {
  headline: string;
  overview: string;
  recommendedHandoff: string;
  runtime: AiRuntime;
  supportPacket: {
    category: IssueType;
    severity: Severity;
    customerStory: string;
    attemptedFixes: string;
    nextBestAction: string;
  };
}

export interface DiagnosisInput {
  language: AppLanguage;
  issueType: IssueType;
  symptoms: string;
  attemptedFixes: string;
}

export interface StoredSession extends DiagnosisInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  diagnosis: DiagnosisResult | null;
  summary: SessionSummary | null;
  stepStates: Record<string, StepStatus>;
}
