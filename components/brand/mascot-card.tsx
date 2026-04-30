"use client";

import Image from "next/image";
import { useLanguage } from "@/components/ui/language-provider";
import { issueOptions } from "@/lib/i18n";

export function MascotCard() {
  const { language, copy } = useLanguage();
  const signalSet = issueOptions(language).slice(0, 4);
  const protocolSet = [copy.intakeTitle, copy.structuredTitle, copy.escalationTitle];

  return (
    <section className="panel mascot-panel">
      <div className="mascot-visual">
        <div className="mascot-stage">
          <div className="mascot-stage-frame">
            <Image
              className="mascot-icon-full"
              src="/brand/akari-agent.svg"
              alt="Akari support guide icon"
              width={320}
              height={320}
              priority
            />
          </div>
        </div>
      </div>
      <div className="mascot-copy">
        <p className="eyebrow">{copy.characterIdentity}</p>
        <h2>{copy.mascotTitle}</h2>
        <p>{copy.mascotBody}</p>
        <div className="hero-signal-cloud">
          {signalSet.map((signal) => (
            <span className="hero-signal" key={signal.value}>
              {signal.title}
            </span>
          ))}
        </div>
        <div className="mascot-note-grid">
          {protocolSet.map((label, index) => (
            <article className="mascot-note" key={label}>
              <span className="meta-label">0{index + 1}</span>
              <strong>{label}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
