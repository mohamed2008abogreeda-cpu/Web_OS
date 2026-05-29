import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        os: {
          bg: "var(--os-bg)",
          accent: "var(--os-accent)",
        }
      },
      boxShadow: {
        os: "var(--os-shadow)",
        'os-border': "var(--os-border)",
      },
      borderRadius: {
        os: "var(--os-radius)",
      }
    }
  },
  plugins: [],
};
export default config;
