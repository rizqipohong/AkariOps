"use client";

import Image from "next/image";
import { useLanguage } from "@/components/ui/language-provider";

export function MascotCard() {
  const { copy } = useLanguage();

  return (
    <section className="panel mascot-panel">
      <div className="mascot-visual">
        <Image
          src="/brand/akari-agent.svg"
          alt="Akari anime-inspired support guide"
          width={260}
          height={260}
        />
      </div>
      <div className="mascot-copy">
        <p className="eyebrow">{copy.characterIdentity}</p>
        <h2>{copy.mascotTitle}</h2>
        <p>{copy.mascotBody}</p>
      </div>
    </section>
  );
}
