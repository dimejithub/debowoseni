/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        lime: "var(--lime)",
        violet: "var(--violet)",
        // shadcn aliases mapped to our dark system
        background: "var(--bg)",
        foreground: "var(--ink)",
        card: { DEFAULT: "var(--surface)", foreground: "var(--ink)" },
        popover: { DEFAULT: "var(--surface)", foreground: "var(--ink)" },
        primary: { DEFAULT: "var(--lime)", foreground: "var(--bg)" },
        secondary: { DEFAULT: "var(--surface-2)", foreground: "var(--ink)" },
        accent: { DEFAULT: "var(--surface-2)", foreground: "var(--ink)" },
        destructive: { DEFAULT: "#e25656", foreground: "var(--ink)" },
        border: "var(--line)",
        input: "var(--line)",
        ring: "var(--lime)",
      },
      borderRadius: {
        lg: "20px",
        md: "16px",
        sm: "10px",
      },
      fontFamily: {
        display: ['"InterDisplay"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        script: ['"Italianno"', "cursive"],
      },
      keyframes: {
        "marquee-x": {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "marquee-x": "marquee-x 28s linear infinite",
        "marquee-fast": "marquee-x 18s linear infinite",
        "fade-up": "fade-up 0.7s ease-out forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
