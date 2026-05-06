import type { Config } from "tailwindcss";

/**
 * Brand tokens extracted from www.adisseo.com (compiled CSS, Apr 2026):
 *   primary   #A70A2D  — Adisseo crimson (used 11x, dominant brand color)
 *   secondary #00A3C4  — Adisseo cyan (used 4x)
 *   accent    #D97641  — warm orange (used 3x)
 *   warning   #FE6907  — bright orange-red (used 1x for emphasis)
 *
 * Neutrals from the same CSS:
 *   ink   #445055  — body / strong text
 *   muted #968A9C / #969696  — secondary text
 *   line  #DEDEDE  — borders
 *   bg    #FBF9F9  — warm off-white panels
 *   tint  #F3F5F7  — cool gray panels
 */

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        adisseo: {
          DEFAULT: "#A70A2D",
          crimson: "#A70A2D",
          "crimson-dark": "#7A0721",
          "crimson-soft": "#C9395A",
          cyan: "#00A3C4",
          "cyan-soft": "#5BC4DC",
          orange: "#D97641",
          "orange-bright": "#FE6907",
          ink: "#445055",
          "ink-strong": "#1F252A",
          muted: "#968A9C",
          "muted-soft": "#C7BFCD",
          line: "#DEDEDE",
          "line-soft": "#EEECEC",
          /** Page wash — cool neutral (replaces warm-only canvas). */
          bg: "#eef1f6",
          /** Slightly deeper canvas for layered UIs. */
          canvas: "#e4e8f0",
          tint: "#F3F5F7",
          /** Soft rose-white panels (accent backgrounds). */
          warmth: "#FBF7F8",
          /** App chrome — left rail, command surfaces. */
          sidebar: "#0f1218",
          "sidebar-border": "#1e2530",
          "sidebar-muted": "#8b95a8",
          "sidebar-fg": "#e9ecf1",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        "adi-card":
          "0 1px 2px rgba(15,18,24,0.04), 0 4px 16px rgba(15,18,24,0.06)",
        "adi-card-hover":
          "0 2px 4px rgba(15,18,24,0.05), 0 12px 28px rgba(15,18,24,0.08)",
        "adi-sidebar": "4px 0 24px rgba(0,0,0,0.12)",
      },
      backgroundImage: {
        "adisseo-gradient":
          "linear-gradient(135deg, #A70A2D 0%, #C9395A 60%, #D97641 100%)",
        "adisseo-gradient-soft":
          "linear-gradient(135deg, rgba(167,10,45,0.08) 0%, rgba(0,163,196,0.06) 100%)",
        /** Subtle mesh for SaaS canvas — used on body. */
        "adi-mesh":
          "radial-gradient(1200px 600px at 10% -10%, rgba(167,10,45,0.06), transparent 55%), radial-gradient(900px 500px at 90% 0%, rgba(0,163,196,0.07), transparent 50%), linear-gradient(180deg, #eef1f6 0%, #e8ecf4 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
