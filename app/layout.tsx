import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/ui/language-provider";
import { SiteHeader } from "@/components/ui/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "AkariOps",
  description: "AI-first anime-inspired troubleshooting agent for retail operations.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <div className="site-shell">
            <SiteHeader />
            <main className="page-shell">{children}</main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
