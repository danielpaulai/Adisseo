import Link from "next/link";

type DeliverableOption = {
  label: string;
  detail: string;
  href?: string;
  active?: boolean;
};

export function StudioDeliverableOptions({
  title = "Deliverable menu",
  options,
}: {
  title?: string;
  options: DeliverableOption[];
}) {
  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-3 text-xs">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
        {title}
      </p>
      <div className="mt-2 space-y-1.5">
        {options.map((option) => {
          const body = (
            <>
              <span className="font-semibold text-adisseo-ink-strong">
                {option.label}
              </span>
              <span className="block text-[10px] leading-snug text-adisseo-muted">
                {option.detail}
              </span>
            </>
          );

          const className = `block rounded-xl border px-3 py-2 transition ${
            option.active
              ? "border-adisseo-crimson bg-adisseo-crimson/5"
              : "border-adisseo-line bg-adisseo-bg/40 hover:border-adisseo-crimson"
          }`;

          return option.href ? (
            <Link key={option.label} href={option.href} className={className}>
              {body}
            </Link>
          ) : (
            <div key={option.label} className={className}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
