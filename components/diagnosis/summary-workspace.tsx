"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AiLoadingState } from "@/components/ui/ai-loading-state";
import { useLanguage } from "@/components/ui/language-provider";
import { Panel } from "@/components/ui/panel";
import { StatusChip } from "@/components/ui/status-chip";
import { issueTypeLabel, runtimeLabel, severityLabel } from "@/lib/i18n";
import { getSession, upsertSession } from "@/lib/session-store";
import type { SessionSummary, StoredSession } from "@/types/diagnosis";

type SummaryWorkspaceProps = {
  sessionId: string;
};

export function SummaryWorkspace({ sessionId }: SummaryWorkspaceProps) {
  const { language, copy } = useLanguage();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const existing = getSession(sessionId);
      setSession(existing);
      setSummary(existing?.summary ?? null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [sessionId]);

  useEffect(() => {
    if (!session || summary || !session.diagnosis) {
      return;
    }

    void (async () => {
      try {
        setIsGeneratingSummary(true);
        const response = await fetch("/api/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...session,
            language,
          }),
        });

        const payload = (await response.json()) as { summary?: SessionSummary; error?: string };

        if (!response.ok || !payload.summary) {
          throw new Error(payload.error || copy.summaryFailed);
        }

        const nextSession: StoredSession = {
          ...session,
          language,
          updatedAt: new Date().toISOString(),
          summary: payload.summary,
        };

        upsertSession(nextSession);
        setSession(nextSession);
        setSummary(payload.summary);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : copy.summaryFailed);
      } finally {
        setIsGeneratingSummary(false);
      }
    })();
  }, [copy.summaryFailed, language, session, summary]);

  if (!session || !session.diagnosis) {
    return (
      <Panel>
        <h1>{copy.sessionNotFound}</h1>
        <p>{copy.sessionNotFoundBody}</p>
        <Link className="primary-button" href="/diagnose">
          {copy.startDiagnosis}
        </Link>
      </Panel>
    );
  }

  const runtime = summary?.runtime ?? session.diagnosis.runtime;

  return (
    <div className="stack-lg">
      <Panel>
        {isGeneratingSummary && !summary ? (
          <AiLoadingState
            eyebrow={copy.supportReadyHandoff}
            title={copy.summaryLoadingTitle}
            body={copy.summaryLoadingBody}
            steps={[
              copy.summaryLoadingStepOne,
              copy.summaryLoadingStepTwo,
              copy.summaryLoadingStepThree,
            ]}
          />
        ) : (
          <>
            <div className="result-header summary-result-header">
              <div>
                <p className="eyebrow">{copy.supportReadyHandoff}</p>
                <h1 className="summary-page-title">{summary?.headline ?? copy.preparingSummary}</h1>
              </div>
              <div className="mini-stats">
                <StatusChip label={runtimeLabel(runtime, language)} tone={runtime.mode === "live" ? "success" : "warning"} />
                <StatusChip label={severityLabel(session.diagnosis.severity, language)} tone="warning" />
              </div>
            </div>
            <p className="lead-copy">{summary?.overview ?? copy.preparingSummaryBody}</p>
            {isGeneratingSummary ? <p className="muted-copy">{copy.generatingHandoff}</p> : null}
          </>
        )}
        {error ? <p className="error-text">{error}</p> : null}
      </Panel>

      {summary ? (
        <div className="workspace-grid">
          <Panel>
            <p className="eyebrow">{copy.recommendedHandoff}</p>
            <h2 className="summary-handoff-title">{summary.recommendedHandoff}</h2>
            <div className="stack-sm">
              <span className="meta-label">{copy.customerStory}</span>
              <p>{summary.supportPacket.customerStory}</p>
            </div>
            <div className="stack-sm">
              <span className="meta-label">{copy.attemptedFixesLabel}</span>
              <p>{summary.supportPacket.attemptedFixes}</p>
            </div>
            <div className="stack-sm">
              <span className="meta-label">{copy.nextBestAction}</span>
              <p>{summary.supportPacket.nextBestAction}</p>
            </div>
          </Panel>

          <Panel>
            <p className="eyebrow">{copy.casePacket}</p>
            <div className="meta-grid">
              <div>
                <span className="meta-label">{copy.category}</span>
                <strong>{issueTypeLabel(summary.supportPacket.category, language)}</strong>
              </div>
              <div>
                <span className="meta-label">{copy.severity}</span>
                <strong>{severityLabel(summary.supportPacket.severity, language)}</strong>
              </div>
              <div>
                <span className="meta-label">{copy.model}</span>
                <strong>{summary.runtime.model}</strong>
              </div>
            </div>
            <div className="button-row">
              <Link className="primary-button" href={`/diagnose/${session.id}`}>
                {copy.backToDiagnosis}
              </Link>
              <Link className="ghost-button" href="/history">
                {copy.viewHistory}
              </Link>
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
