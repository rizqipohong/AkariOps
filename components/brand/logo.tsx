import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  subtitle: string;
};

export function Logo({ compact = false, subtitle }: LogoProps) {
  return (
    <Link className="brand-lockup" href="/">
      <span className="brand-emblem" aria-hidden="true">
        AO
      </span>
      {!compact ? (
        <span>
          <strong>AkariOps</strong>
          <span className="brand-subtitle">{subtitle}</span>
        </span>
      ) : null}
    </Link>
  );
}
