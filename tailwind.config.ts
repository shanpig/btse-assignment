import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        systemGray: "var(--system-gray)",
        systemGreen: "var(--system-green)",
        systemRed: "var(--system-red)",
        systemBlue: "var(--system-blue)",
        "systemGreen-12": "var(--system-green-12)",
        "systemRed-12": "var(--system-red-12)",
        "systemGreen-50": "var(--system-green-50)",
        "systemRed-50": "var(--system-red-50)",
      },
    },
  },
  plugins: [],
} satisfies Config;
