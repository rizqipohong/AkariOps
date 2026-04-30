"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { useLanguage } from "@/components/ui/language-provider";
import type { AppLanguage } from "@/types/diagnosis";

export function SiteHeader() {
  const { language, setLanguage, copy } = useLanguage();

  function setNextLanguage(nextLanguage: AppLanguage) {
    setLanguage(nextLanguage);
  }

  return (
    <header className="site-header">
      <Logo subtitle={copy.brandSubtitle} />
      <div className="site-nav-wrap">
        <nav className="site-nav">
          <Link href="/diagnose">{copy.navDiagnose}</Link>
          <Link href="/history">{copy.navHistory}</Link>
        </nav>
        <div className="lang-switch" aria-label="Language switcher">
          <button
            className={language === "en" ? "lang-button lang-button-active" : "lang-button"}
            type="button"
            onClick={() => setNextLanguage("en")}
          >
            {copy.navEnglish}
          </button>
          <button
            className={language === "id" ? "lang-button lang-button-active" : "lang-button"}
            type="button"
            onClick={() => setNextLanguage("id")}
          >
            {copy.navIndonesian}
          </button>
        </div>
      </div>
    </header>
  );
}
