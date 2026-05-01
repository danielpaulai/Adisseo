"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
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
      { href: "/news-bridge", label: "Article matcher", icon: Newspaper },
    ],
  },
  {
    label: "Operate",
    items: [
      { href: "/dashboard", label: "War room", icon: Activity },
      { href: "/approval-queue", label: "HQ approvals", icon: ShieldCheck },
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
    <nav className="flex flex-1 flex-col gap-6 px-3 py-4">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
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
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-adisseo-crimson/10 text-adisseo-crimson"
                        : "text-adisseo-ink hover:bg-adisseo-bg"
                    }`}
                  >
                    <Icon size={16} className="shrink-0 opacity-80" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="border-t border-adisseo-line pt-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-adisseo-muted hover:bg-adisseo-bg hover:text-adisseo-crimson"
        >
          <LayoutGrid size={16} />
          Full catalogue
        </Link>
        <Link
          href="/login"
          onClick={onNavigate}
          className="mt-0.5 flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-adisseo-muted hover:bg-adisseo-bg hover:text-adisseo-crimson"
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
    <div className="flex min-h-screen bg-adisseo-bg">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-adisseo-line bg-white lg:flex">
        <div className="flex items-center gap-2 border-b border-adisseo-line px-4 py-4">
          <Logo size="sm" />
        </div>
        <SidebarNav pathname={pathname} />
        <div className="mt-auto space-y-2 border-t border-adisseo-line p-3">
          <TenantSwitcher compact />
          <LiveModeChip />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden
          onClick={closeMobile}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-adisseo-line bg-white shadow-xl transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-adisseo-line px-4 py-3">
          <Logo size="sm" />
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-2 text-adisseo-muted hover:bg-adisseo-bg hover:text-adisseo-ink-strong"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarNav pathname={pathname} onNavigate={closeMobile} />
        <div className="space-y-2 border-t border-adisseo-line p-3">
          <TenantSwitcher compact />
          <LiveModeChip />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-adisseo-line bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-adisseo-ink-strong hover:bg-adisseo-bg"
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
