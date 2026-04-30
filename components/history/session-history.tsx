"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/ui/language-provider";
import { issueTypeLabel, severityLabel } from "@/lib/i18n";
import { listSessions } from "@/lib/session-store";
import { Panel } from "@/components/ui/panel";
import { StatusChip } from "@/components/ui/status-chip";
import type { StoredSession } from "@/types/diagnosis";

export function SessionHistory() {
  const { language, copy } = useLanguage();
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSessions(listSessions());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Panel>
      <div className="panel-heading">
        <p className="eyebrow">{copy.historyEyebrow}</p>
        <h1>{copy.historyTitle}</h1>
      </div>

      {sessions.length > 0 ? (
        <div className="history-list">
          {sessions.map((session) => (
            <article className="history-card" key={session.id}>
              <div className="section-header">
                <h2>{session.diagnosis?.summary ?? copy.draftSession}</h2>
                <StatusChip
                  label={severityLabel(session.diagnosis?.severity ?? "medium", language)}
                  tone="warning"
                />
              </div>
              <p>{session.symptoms}</p>
              <div className="meta-grid">
                <div>
                  <span className="meta-label">{copy.category}</span>
                  <strong>{issueTypeLabel(session.issueType, language)}</strong>
                </div>
                <div>
                  <span className="meta-label">{copy.updated}</span>
                  <strong>{new Date(session.updatedAt).toLocaleString(language === "id" ? "id-ID" : "en-US")}</strong>
                </div>
              </div>
              <div className="button-row">
                <Link className="secondary-button" href={`/diagnose/${session.id}`}>
                  {copy.reopenSession}
                </Link>
                <Link className="ghost-button" href={`/summary/${session.id}`}>
                  {copy.viewSummary}
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{copy.noSessionsYet}</h2>
          <p>{copy.noSessionsBody}</p>
          <Link className="primary-button" href="/diagnose">
            {copy.startDiagnosis}
          </Link>
        </div>
      )}
    </Panel>
  );
}
