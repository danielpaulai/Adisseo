import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { StakeholderMapsSupabaseSync } from "@/components/StakeholderMapsSupabaseSync";
import "./globals.css";

export const metadata: Metadata = {
  title: "APAC AI · Adisseo APAC",
  description:
    "News-to-strategy bridge for Adisseo APAC — built around the APAC marketing framework.",
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
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <StakeholderMapsSupabaseSync />
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "border border-adisseo-line bg-white text-adisseo-ink-strong shadow-lg",
            },
          }}
        />
      </body>
    </html>
  );
}
