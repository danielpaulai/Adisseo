import { createRequire } from "module";

const require = createRequire(import.meta.url);

const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");

/** ESLint flat config — Next core-web-vitals, minus hooks rules that flag legacy demo patterns. */
const config = [
  {
    ignores: [".next/**", "out/**", "node_modules/**", "dist/**"],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      "import/no-anonymous-default-export": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default config;
