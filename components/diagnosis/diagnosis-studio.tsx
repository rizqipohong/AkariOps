"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IssuePicker } from "@/components/diagnosis/issue-picker";
import { AiLoadingState } from "@/components/ui/ai-loading-state";
import { useLanguage } from "@/components/ui/language-provider";
import { Panel } from "@/components/ui/panel";
import { StatusChip } from "@/components/ui/status-chip";
import { issueTypeLabel, runtimeLabel, severityLabel, stepStatusLabel } from "@/lib/i18n";
import { getSession, updateStepStatus, upsertSession } from "@/lib/session-store";
import { formatPercent } from "@/lib/utils";
import type { DiagnosisResult, IssueType, StepStatus, StoredSession } from "@/types/diagnosis";

type DiagnosisStudioProps = {
  sessionId?: string;
};

function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}`;
}

function emptySessionState(
  sessionId: string,
  language: StoredSession["language"],
  issueType: IssueType,
  symptoms: string,
  attemptedFixes: string,
) {
  const now = new Date().toISOString();

  return {
    id: sessionId,
    language,
    issueType,
    symptoms,
    attemptedFixes,
    createdAt: now,
    updatedAt: now,
    diagnosis: null,
    summary: null,
    stepStates: {},
  } satisfies StoredSession;
}

function toneForSeverity(severity: DiagnosisResult["severity"]) {
  switch (severity) {
    case "low":
      return "success";
    case "medium":
      return "warning";
    case "high":
    case "critical":
      return "danger";
    default:
      return "neutral";
  }
}

function toneForRuntime(runtime: DiagnosisResult["runtime"]["mode"]) {
  return runtime === "live" ? "success" : "warning";
}

function toneForStep(status: StepStatus) {
  switch (status) {
    case "passed":
      return "success";
    case "failed":
      return "danger";
    default:
      return "neutral";
  }
}

export function DiagnosisStudio({ sessionId }: DiagnosisStudioProps) {
  const { language, copy } = useLanguage();
  const router = useRouter();
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [issueType, setIssueType] = useState<IssueType>("scanner");
  const [symptoms, setSymptoms] = useState("");
  const [attemptedFixes, setAttemptedFixes] = useState("");
  const [session, setSession] = useState<StoredSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const timer = window.setTimeout(() => {
      const existing = getSession(sessionId);
      if (!existing) {
        return;
      }

      setSession(existing);
      setIssueType(existing.issueType);
      setSymptoms(existing.symptoms);
      setAttemptedFixes(existing.attemptedFixes);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [sessionId]);

  const diagnosis = session?.diagnosis ?? null;
  const activeSessionId = session?.id ?? sessionId;

  const statusCounts = useMemo(() => {
    const entries = Object.values(session?.stepStates ?? {});

    return {
      passed: entries.filter((status) => status === "passed").length,
      failed: entries.filter((status) => status === "failed").length,
      pending: entries.filter((status) => status === "pending").length,
    };
  }, [session?.stepStates]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsDiagnosing(true);

    const nextSessionId = activeSessionId ?? newSessionId();
    const baseSession = emptySessionState(nextSessionId, language, issueType, symptoms, attemptedFixes);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          issueType,
          symptoms,
          attemptedFixes,
        }),
      });

      const payload = (await response.json()) as
        | { diagnosis?: DiagnosisResult; error?: string }
        | undefined;

      if (!response.ok || !payload?.diagnosis) {
        throw new Error(payload?.error || copy.diagnosisFailed);
      }

      const nextSession: StoredSession = {
        ...baseSession,
        diagnosis: payload.diagnosis,
      };

      upsertSession(nextSession);
      setSession(nextSession);

      if (!sessionId) {
        router.replace(`/diagnose/${nextSessionId}`);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.diagnosisFailed);
    } finally {
      setIsDiagnosing(false);
    }
  }

  function markStep(stepId: string, status: StepStatus) {
    if (!activeSessionId) {
      return;
    }

    const nextSession = updateStepStatus(activeSessionId, stepId, status);
    if (nextSession) {
      setSession(nextSession);
    }
  }

  return (
    <div className="workspace-grid">
      <Panel className="form-panel">
        <div className="panel-heading">
          <p className="eyebrow">{copy.missionIntake}</p>
          <h1 className="workspace-title">{copy.diagnosisHeading}</h1>
        </div>

        <form className="stack-lg" onSubmit={handleSubmit}>
          <div className="stack-sm">
            <label className="label">{copy.issueCategory}</label>
            <IssuePicker value={issueType} onChange={setIssueType} disabled={isDiagnosing} />
          </div>

          <div className="stack-sm">
            <label className="label" htmlFor="symptoms">
              {copy.symptoms}
            </label>
            <textarea
              id="symptoms"
              className="textarea"
              rows={6}
              placeholder={copy.symptomsPlaceholder}
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
              disabled={isDiagnosing}
              required
            />
          </div>

          <div className="stack-sm">
            <label className="label" htmlFor="attempted-fixes">
              {copy.attemptedFixes}
            </label>
            <textarea
              id="attempted-fixes"
              className="textarea"
              rows={4}
              placeholder={copy.attemptedFixesPlaceholder}
              value={attemptedFixes}
              onChange={(event) => setAttemptedFixes(event.target.value)}
              disabled={isDiagnosing}
            />
          </div>

          <button className="primary-button" type="submit" disabled={isDiagnosing}>
            {isDiagnosing ? copy.tracingFault : copy.runDiagnosis}
          </button>

          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </Panel>

      <Panel className="result-panel">
        {isDiagnosing ? (
          <AiLoadingState
            eyebrow={copy.diagnosisResult}
            title={copy.diagnosisLoadingTitle}
            body={copy.diagnosisLoadingBody}
            steps={[
              copy.diagnosisLoadingStepOne,
              copy.diagnosisLoadingStepTwo,
              copy.diagnosisLoadingStepThree,
            ]}
          />
        ) : diagnosis ? (
          <div className="stack-lg">
            <div className="result-header workspace-result-header">
              <div>
                <p className="eyebrow">{copy.diagnosisResult}</p>
                <h2 className="workspace-result-title">{diagnosis.summary}</h2>
              </div>
              <div className="mini-stats">
                <StatusChip
                  label={runtimeLabel(diagnosis.runtime, language)}
                  tone={toneForRuntime(diagnosis.runtime.mode)}
                />
                <StatusChip
                  label={severityLabel(diagnosis.severity, language)}
                  tone={toneForSeverity(diagnosis.severity)}
                />
              </div>
            </div>

            <div className="meta-row">
              <div>
                <span className="meta-label">{copy.confidence}</span>
                <strong>{formatPercent(diagnosis.confidence)}</strong>
              </div>
              <div>
                <span className="meta-label">{copy.category}</span>
                <strong>{issueTypeLabel(diagnosis.issueType, language)}</strong>
              </div>
              <div>
                <span className="meta-label">{copy.escalation}</span>
                <strong>{diagnosis.escalationNeeded ? copy.recommended : copy.notYet}</strong>
              </div>
              <div>
                <span className="meta-label">{copy.model}</span>
                <strong>{diagnosis.runtime.model}</strong>
              </div>
            </div>

            <div className="stack-sm">
              <h3>{copy.probableCauses}</h3>
              <ul className="bullet-list">
                {diagnosis.probableCauses.map((cause) => (
                  <li key={cause}>{cause}</li>
                ))}
              </ul>
            </div>

            <div className="stack-sm">
              <div className="section-header">
                <h3>{copy.troubleshootingSteps}</h3>
                <div className="mini-stats">
                  <StatusChip label={`${statusCounts.passed} ${copy.passed}`} tone="success" />
                  <StatusChip label={`${statusCounts.failed} ${copy.failed}`} tone="danger" />
                </div>
              </div>

              <div className="step-list">
                {diagnosis.steps.map((step) => {
                  const currentStatus = session?.stepStates[step.id] ?? "pending";

                  return (
                    <article key={step.id} className="step-card">
                      <div className="section-header">
                        <h4>{step.title}</h4>
                        <StatusChip
                          label={stepStatusLabel(currentStatus, language)}
                          tone={toneForStep(currentStatus)}
                        />
                      </div>
                      <p>{step.instruction}</p>
                      <p className="muted-copy">
                        {copy.expected}: {step.expectedResult}
                      </p>
                      <p className="muted-copy">
                        {copy.whyItMatters}: {step.whyItMatters}
                      </p>
                      <div className="button-row">
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => markStep(step.id, "passed")}
                        >
                          {copy.markPassed}
                        </button>
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => markStep(step.id, "failed")}
                        >
                          {copy.stillFailing}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="stack-sm">
              <h3>{copy.nextMove}</h3>
              <p>{diagnosis.nextAction}</p>
              {diagnosis.recommendedServiceAction ? (
                <p className="muted-copy">
                  {copy.supportPath}: {diagnosis.recommendedServiceAction}
                </p>
              ) : null}
              {diagnosis.recommendedProducts.length > 0 ? (
                <div>
                  <span className="meta-label">{copy.suggestedBackups}</span>
                  <ul className="bullet-list">
                    {diagnosis.recommendedProducts.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {activeSessionId ? (
              <div className="button-row">
                <Link className="primary-button" href={`/summary/${activeSessionId}`}>
                  {copy.buildHandoffSummary}
                </Link>
                <Link className="ghost-button" href="/history">
                  {copy.viewSessionHistory}
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">{copy.awaitingDiagnosis}</p>
            <h2>{copy.noFaultMapYet}</h2>
            <p>{copy.emptyDiagnosisBody}</p>
          </div>
        )}
      </Panel>
    </div>
  );
}
