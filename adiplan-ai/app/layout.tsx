import type { Metadata, Viewport } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { Phase8SupabaseSync } from "@/components/Phase8SupabaseSync";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "APAC AI · Adisseo APAC",
  description:
    "Competitor intelligence through species studios — Vault-grounded deliverables with trust gates and distribution rails for Adisseo APAC.",
  icons: {
    icon: "/brand/logo.png",
    shortcut: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#A70A2D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${publicSans.className} adi-app-body min-h-screen font-sans antialiased`}
      >
        <Phase8SupabaseSync />
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "border border-adisseo-line/90 bg-white/95 text-adisseo-ink-strong shadow-adi-card backdrop-blur-sm",
            },
          }}
        />
      </body>
    </html>
  );
}
