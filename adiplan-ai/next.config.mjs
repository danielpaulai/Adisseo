import os from "node:os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Next.js blocks cross-origin access to dev-only `/_next/*` assets unless the browser
 * host is allowlisted. Visiting via http://LAN_IP:3000 counts as a non-localhost origin,
 * so CSS/JS appears to "not load". We merge localhost + this machine's LAN IPv4s +
 * optional `DEV_LAN_ALLOWED_ORIGINS` (comma-separated) so LAN phones/tablets work without
 * hand-maintaining IPs after DHCP changes.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
 */
function devAllowedOrigins() {
  const fromEnv =
    process.env.DEV_LAN_ALLOWED_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const fromInterfaces = [];
  try {
    for (const group of Object.values(os.networkInterfaces())) {
      if (!group) continue;
      for (const net of group) {
        if (net.family !== "IPv4" || net.internal) continue;
        fromInterfaces.push(net.address);
      }
    }
  } catch {
    // Sandboxed CI / hardened hosts may block uv_interface_addresses; env override still works.
  }

  return [...new Set(["localhost", "127.0.0.1", ...fromInterfaces, ...fromEnv])];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@liveblocks/core",
    "@liveblocks/client",
    "@liveblocks/react",
    "@liveblocks/react-ui",
    "@liveblocks/react-flow",
  ],
  ...(process.env.NODE_ENV !== "production"
    ? { allowedDevOrigins: devAllowedOrigins() }
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
  // These packages use ESM-only internals that webpack can't bundle correctly.
  // Marking them as external lets Node require() them at runtime instead.
  serverExternalPackages: [
    "@react-email/render",
    "@react-email/components",
    "html-to-text",
    "selderee",
    "parseley",
    "leac",
  ],
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    // Some Next/Webpack builds resolve @liveblocks/core through a path that
    // loses ESM named exports. Pin to the explicit ESM entry file.
    config.resolve.alias["@liveblocks/core$"] = path.resolve(
      __dirname,
      "node_modules/@liveblocks/core/dist/index.js"
    );
    return config;
  },
};

export default nextConfig;
