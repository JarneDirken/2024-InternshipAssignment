import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "mobile-hero": "url(/assets/svg/MobileLines.svg)",
        "pc-hero": "url(/assets/svg/DesktopLines.svg)",
      },
      colors: {
        "title-gradient": "linear-gradient(to right, #FF8400, #F6CA45, #CF4307)",
        "custom-accent": "#CF4307",
        "custom-primary": "#FF8400",
        "custom-secondary": "#FFF5D6",
        "custom-tertiary": "FEE2BD",
      }
    },
  },
  plugins: [],
};
export default config;
