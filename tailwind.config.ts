import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "mobile-hero": "url(/assets/svg/MobileLines.svg)",
        "pc-hero": "url(/assets/svg/DesktopLines.svg)",
      },
      colors: {
        "title-gradient": "linear-gradient(to right, #FF8400, #F6CA45, #CF4307)",
        "middle-gradient": "#F6CA45",
        "custom-accent": "#CF4307",
        "custom-primary": "#FF8400",
        "custom-primary-hover": "#ed7b00",
        "custom-secondary": "#FFF5D6",
        "custom-tertiary": "#FEE2BD",
        "custom-login": "#FFF5D6",
        "custom-button-primary": "#130E01",
        "custom-login2": "#ffb361",
        "custom-gray": "#949494",
        "custom-green": "#0C7403",
        "custom-green-hover": "#0c9c00",
        "custom-red": "#FF0000",
        "custom-red-hover": "#db1818",
        "custom-blue": "#00C2FF",
        "custom-light-orange": "#ffb96e",
        "custom-dark-blue": "#007DC4",
      },
      screens: {
        'xs': '480px',
      }
    },
  },
  plugins: [],
};
export default config;
