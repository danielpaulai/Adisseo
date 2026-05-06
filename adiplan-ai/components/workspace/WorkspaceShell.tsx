"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileCheck,
  LayoutGrid,
  Library,
  Menu,
  Newspaper,
  Share2,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { LiveModeChip } from "@/components/LiveModeChip";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Pipeline",
    items: [
      { href: "/competitor-watch", label: "Competitor Watch", icon: Newspaper },
    ],
  },
  {
    label: "Operate",
    items: [
      { href: "/dashboard", label: "War room", icon: Activity },
      { href: "/approval-queue", label: "Regional approvals", icon: ShieldCheck },
      { href: "/distribution", label: "Distribution", icon: Share2 },
      { href: "/engagement-tracker", label: "Engagement", icon: Target },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { href: "/vault", label: "Vault", icon: Library },
      { href: "/trust-layer", label: "Trust layer", icon: FileCheck },
    ],
  },
];

function navActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/") return false;
  return pathname.startsWith(`${href}/`);
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-6 px-2 py-4">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-adisseo-sidebar-muted">
            {g.label}
          </p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const Icon = item.icon;
              const active = navActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-white/10 text-white shadow-inner ring-1 ring-white/10"
                        : "text-adisseo-sidebar-muted hover:bg-white/5 hover:text-adisseo-sidebar-fg"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={`shrink-0 ${active ? "text-adisseo-crimson-soft" : "opacity-75"}`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="border-t border-adisseo-sidebar-border pt-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-adisseo-sidebar-muted transition hover:bg-white/5 hover:text-adisseo-sidebar-fg"
        >
          <LayoutGrid size={17} />
          Full catalogue
        </Link>
        <Link
          href="/login"
          onClick={onNavigate}
          className="mt-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-adisseo-sidebar-muted transition hover:bg-white/5 hover:text-adisseo-sidebar-fg"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-20 hidden h-screen w-60 shrink-0 flex-col border-r border-adisseo-sidebar-border bg-adisseo-sidebar shadow-adi-sidebar lg:flex">
        <div className="flex items-center gap-2 border-b border-adisseo-sidebar-border px-4 py-5">
          <Logo size="sm" variant="onDark" />
        </div>
        <SidebarNav pathname={pathname} />
        <div className="mt-auto space-y-2 border-t border-adisseo-sidebar-border p-3">
          <TenantSwitcher compact variant="sidebar" />
          <LiveModeChip variant="sidebar" />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden
          onClick={closeMobile}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-adisseo-sidebar-border bg-adisseo-sidebar shadow-2xl transition-transform duration-200 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-adisseo-sidebar-border px-4 py-4">
          <Logo size="sm" variant="onDark" />
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-2 text-adisseo-sidebar-muted transition hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarNav pathname={pathname} onNavigate={closeMobile} />
        <div className="space-y-2 border-t border-adisseo-sidebar-border p-3">
          <TenantSwitcher compact variant="sidebar" />
          <LiveModeChip variant="sidebar" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-adisseo-line/80 bg-white/85 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-adisseo-ink-strong transition hover:bg-adisseo-bg"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <Logo size="sm" />
          <TenantSwitcher compact />
        </header>
        {children}
      </div>
    </div>
  );
}
