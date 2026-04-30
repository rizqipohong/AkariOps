import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { createFallbackDiagnosis, createFallbackSummary } from "@/lib/ai/fallback";
import type { StepStatus, StoredSession } from "@/types/diagnosis";

const STORAGE_KEY = "akariops-sessions";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeSession(
  session: StoredSession | (Omit<StoredSession, "language"> & { language?: StoredSession["language"] }),
) {
  const withLanguage = {
    ...session,
    language: session.language ?? DEFAULT_LANGUAGE,
  } as StoredSession;

  const shouldUpgradeDiagnosis =
    withLanguage.diagnosis?.runtime.provider === "fallback" &&
    withLanguage.diagnosis.runtime.model === "local-playbook";

  if (!shouldUpgradeDiagnosis) {
    return { session: withLanguage, touched: session.language == null };
  }

  const diagnosis = createFallbackDiagnosis(withLanguage);
  const summary =
    withLanguage.summary?.runtime.provider === "fallback"
      ? createFallbackSummary({
          ...withLanguage,
          diagnosis,
        })
      : withLanguage.summary;

  return {
    session: {
      ...withLanguage,
      diagnosis,
      summary,
    },
    touched: true,
  };
}

export function listSessions(): StoredSession[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    let touched = false;
    const sessions = (
      JSON.parse(raw) as Array<StoredSession | (Omit<StoredSession, "language"> & { language?: StoredSession["language"] })>
    ).map((session) => {
      const normalized = normalizeSession(session);
      touched = touched || normalized.touched;
      return normalized.session;
    });

    if (touched) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }

    return sessions.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  } catch {
    return [];
  }
}

export function getSession(sessionId: string): StoredSession | null {
  return listSessions().find((session) => session.id === sessionId) ?? null;
}

export function upsertSession(session: StoredSession): void {
  if (!canUseStorage()) {
    return;
  }

  const sessions = listSessions();
  const index = sessions.findIndex((entry) => entry.id === session.id);

  if (index === -1) {
    sessions.push(session);
  } else {
    sessions[index] = session;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function updateStepStatus(
  sessionId: string,
  stepId: string,
  status: StepStatus,
): StoredSession | null {
  const session = getSession(sessionId);
  if (!session) {
    return null;
  }

  const nextSession: StoredSession = {
    ...session,
    updatedAt: new Date().toISOString(),
    stepStates: {
      ...session.stepStates,
      [stepId]: status,
    },
  };

  upsertSession(nextSession);
  return nextSession;
}
