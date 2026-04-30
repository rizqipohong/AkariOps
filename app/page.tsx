"use client";

import Link from "next/link";
import { MascotCard } from "@/components/brand/mascot-card";
import { useLanguage } from "@/components/ui/language-provider";
import { Panel } from "@/components/ui/panel";

export default function HomePage() {
  const { copy } = useLanguage();
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

  return (
    <div className="stack-xl">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{copy.heroEyebrow}</p>
          <h1>{copy.heroTitle}</h1>
          <p className="lead-copy">{copy.heroBody}</p>
          <div className="button-row">
            <Link className="primary-button" href="/diagnose">{copy.launchDiagnosis}</Link>
            <Link className="ghost-button" href="/history">{copy.viewSessionArchive}</Link>
          </div>
        </div>
        <MascotCard />
      </section>

      <section className="three-up">
        {featureList.map((feature) => (
          <Panel key={feature.title}>
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
