import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  subtitle: string;
};

export function Logo({ compact = false, subtitle }: LogoProps) {
  return (
    <Link className="brand-lockup" href="/">
      <span className="brand-emblem" aria-hidden="true">
        <Image
          className="brand-emblem-img"
          src="/brand/akariops-logo-icon.svg"
          alt=""
          width={52}
          height={52}
          priority
        />
      </span>
      {!compact ? (
        <span className="brand-copy">
          <strong>AkariOps</strong>
          <span className="brand-subtitle">{subtitle}</span>
        </span>
      ) : null}
    </Link>
  );
}
