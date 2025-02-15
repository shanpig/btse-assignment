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
        quoteTableHeadText: "var(--quote-table-head-text)",
        quoteBuyPriceText: "var(--quote-buy-price-text)",
        quoteSellPriceText: "var(--quote-sell-price-text)",
        quoteTableRowHoverText: "var(--quote-table-row-hover-text)",
        quoteBuyAccTotalSizeBar: "var(--quote-buy-acc-total-size-bar)",
        quiteSellAccTotalSizeBar: "var(--quite-sell-acc-total-size-bar)",
        animationFlashGreenBg: "var(--animation-flash-green-bg)",
        animationFlashRedBg: "var(--animation-flash-red-bg)",
      },
    },
  },
  plugins: [],
} satisfies Config;
