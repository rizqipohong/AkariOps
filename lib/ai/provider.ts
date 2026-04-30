import OpenAI from "openai";
import type {
  AiRuntime,
  DiagnosisInput,
  DiagnosisResult,
  SessionSummary,
  StoredSession,
} from "@/types/diagnosis";
import { createFallbackDiagnosis, createFallbackSummary } from "@/lib/ai/fallback";
import { buildDiagnosisMessages, buildSummaryMessages } from "@/lib/ai/prompts";
import { normalizeDiagnosis, normalizeSummary } from "@/lib/ai/schema";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ProviderConfig = {
  provider: "openai" | "openrouter";
  apiKey: string;
  model: string;
  baseURL?: string;
  headers?: Record<string, string>;
};

function resolveAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) {
    return explicit;
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionUrl) {
    return productionUrl.startsWith("http") ? productionUrl : `https://${productionUrl}`;
  }

  const deploymentUrl = process.env.VERCEL_URL;
  if (deploymentUrl) {
    return deploymentUrl.startsWith("http") ? deploymentUrl : `https://${deploymentUrl}`;
  }

  return "http://localhost:3000";
}

function resolveProvider(): ProviderConfig | null {
  const provider = process.env.AI_PROVIDER?.toLowerCase();

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      return null;
    }

    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    };
  }

  if (provider === "openrouter") {
    if (!process.env.OPENROUTER_API_KEY) {
      return null;
    }

    return {
      provider: "openrouter",
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini",
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": resolveAppUrl(),
        "X-Title": "AkariOps",
      },
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    };
  }

  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: "openrouter",
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini",
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": resolveAppUrl(),
        "X-Title": "AkariOps",
      },
    };
  }

  return null;
}

function clientFor(provider: ProviderConfig): OpenAI {
  return new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
    defaultHeaders: provider.headers,
  });
}

function liveRuntime(provider: ProviderConfig): AiRuntime {
  return {
    provider: provider.provider,
    mode: "live",
    model: provider.model,
  };
}

async function callModel(messages: Message[]): Promise<{ content: string; runtime: AiRuntime }> {
  const provider = resolveProvider();

  if (!provider) {
    throw new Error("No AI provider configured.");
  }

  const client = clientFor(provider);
  const completion = await client.chat.completions.create({
    model: provider.model,
    temperature: 0.55,
    response_format: {
      type: "json_object",
    },
    messages,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI response was empty.");
  }

  return {
    content,
    runtime: liveRuntime(provider),
  };
}

export async function runDiagnosis(input: DiagnosisInput): Promise<DiagnosisResult> {
  try {
    const result = await callModel(buildDiagnosisMessages(input));
    return normalizeDiagnosis(input, result.content, result.runtime);
  } catch {
    return createFallbackDiagnosis(input);
  }
}

export async function runSummary(session: StoredSession): Promise<SessionSummary> {
  try {
    const result = await callModel(buildSummaryMessages(session));
    return normalizeSummary(session, result.content, result.runtime);
  } catch {
    return createFallbackSummary(session);
  }
}
