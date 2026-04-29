import Image from "next/image";
import Link from "next/link";

export function Logo({
  size = "md",
  withWordmark = true,
}: {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
}) {
  const dims =
    size === "sm" ? { w: 24, h: 24 } : size === "lg" ? { w: 48, h: 48 } : { w: 32, h: 32 };
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5"
      aria-label="AdiPlan AI home"
    >
      <Image
        src="/brand/logo.png"
        alt="Adisseo"
        width={dims.w}
        height={dims.h}
        priority
        className="object-contain"
      />
      {withWordmark && (
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-adisseo-muted">
            Adisseo &middot; APAC
          </span>
          <span className="text-sm font-bold text-adisseo-ink-strong group-hover:text-adisseo-crimson">
            AdiPlan&nbsp;AI
          </span>
        </span>
      )}
    </Link>
  );
}

export function SpeciesIcon({
  species,
  size = 28,
  className = "",
}: {
  species: "aqua" | "poultry" | "ruminants" | "swine";
  size?: number;
  className?: string;
}) {
  const map = {
    aqua: "/brand/aqua.svg",
    poultry: "/brand/poultry.svg",
    ruminants: "/brand/ruminants.svg",
    swine: "/brand/swine.svg",
  } as const;
  return (
    <Image
      src={map[species]}
      alt={species}
      width={size}
      height={size}
      className={className}
    />
  );
}
