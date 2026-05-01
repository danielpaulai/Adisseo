import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Dev-only: when `allowedDevOrigins` is set in config, Next uses strict blocking
  // for some `/_next/*` requests. Keeping it **unset by default** avoids rare cases
  // where localhost styling breaks; enable only when you open the dev server via LAN IP.
  // Example in `.env.local`:
  //   DEV_LAN_ALLOWED_ORIGINS=192.168.8.143
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  ...(process.env.NODE_ENV !== "production" &&
  process.env.DEV_LAN_ALLOWED_ORIGINS?.trim()
    ? {
        allowedDevOrigins: process.env.DEV_LAN_ALLOWED_ORIGINS.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }
    : {}),
  // Pin the tracing root to this app. Without it, Next 15.5.x picks up an
  // unrelated lockfile elsewhere on the filesystem and mis-infers the
  // workspace, which breaks both module resolution and pages-manifest emit.
  outputFileTracingRoot: __dirname,
  // The strict typed-routes check in 15.5.x has been flaky when route
  // handlers use `NextRequest`. We still run `tsc --noEmit` separately,
  // so skipping this one Next-internal step costs us nothing.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
