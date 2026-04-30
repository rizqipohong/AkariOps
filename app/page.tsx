"use client";

import Link from "next/link";
import { MascotCard } from "@/components/brand/mascot-card";
import { useLanguage } from "@/components/ui/language-provider";
import { Panel } from "@/components/ui/panel";
import { issueTypeLabel } from "@/lib/i18n";

export default function HomePage() {
  const { language, copy } = useLanguage();
  const featureList = [
    {
      title: copy.intakeTitle,
      body: copy.intakeBody,
    },
    {
      title: copy.structuredTitle,
      body: copy.structuredBody,
    },
    {
      title: copy.escalationTitle,
      body: copy.escalationBody,
    },
  ];
  const signalLabels = [
    issueTypeLabel("scanner", language),
    issueTypeLabel("pos", language),
    issueTypeLabel("receipt-printer", language),
    issueTypeLabel("network", language),
  ];

  return (
    <div className="stack-xl">
      <section className="hero-grid hero-grid-rich">
        <div className="hero-copy hero-copy-rich">
          <p className="eyebrow">{copy.heroEyebrow}</p>
          <h1>{copy.heroTitle}</h1>
          <p className="lead-copy">{copy.heroBody}</p>
          <div className="hero-signal-cloud">
            {signalLabels.map((label) => (
              <span className="hero-signal" key={label}>
                {label}
              </span>
            ))}
          </div>
          <div className="hero-ribbon">
            <article className="hero-ribbon-card">
              <span className="meta-label">AI // Guide path</span>
              <strong>{copy.structuredTitle}</strong>
              <p>{copy.structuredBody}</p>
            </article>
            <article className="hero-ribbon-card hero-ribbon-card-accent">
              <span className="meta-label">Ops // Handoff</span>
              <strong>{copy.escalationTitle}</strong>
              <p>{copy.escalationBody}</p>
            </article>
          </div>
          <div className="button-row">
            <Link className="primary-button" href="/diagnose">{copy.launchDiagnosis}</Link>
            <Link className="ghost-button" href="/history">{copy.viewSessionArchive}</Link>
          </div>
        </div>
        <MascotCard />
      </section>

      <section className="three-up">
        {featureList.map((feature, index) => (
          <Panel className="feature-panel" key={feature.title}>
            <div className="feature-index">0{index + 1}</div>
            <p className="eyebrow">{copy.coreCapability}</p>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </Panel>
        ))}
      </section>

      <Panel>
        <div className="section-header">
          <div>
            <p className="eyebrow">{copy.deploymentEyebrow}</p>
            <h2>{copy.deploymentTitle}</h2>
          </div>
          <Link className="secondary-button" href="/diagnose">{copy.navDiagnose}</Link>
        </div>
        <p>{copy.deploymentBody}</p>
      </Panel>
    </div>
  );
}
