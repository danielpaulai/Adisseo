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
          bg: "#FBF9F9",
          tint: "#F3F5F7",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "adisseo-gradient":
          "linear-gradient(135deg, #A70A2D 0%, #C9395A 60%, #D97641 100%)",
        "adisseo-gradient-soft":
          "linear-gradient(135deg, rgba(167,10,45,0.08) 0%, rgba(0,163,196,0.06) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
