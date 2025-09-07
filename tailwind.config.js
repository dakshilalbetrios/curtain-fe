/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "theme-bg-primary": "var(--bg-primary)",
        "theme-bg-secondary": "var(--bg-secondary)",
        "theme-bg-tertiary": "var(--bg-tertiary)",
        "theme-bg-card": "var(--bg-card)",
        "theme-bg-elevated": "var(--bg-elevated)",
        "theme-text-primary": "var(--text-primary)",
        "theme-text-secondary": "var(--text-secondary)",
        "theme-text-tertiary": "var(--text-tertiary)",
        "theme-border-primary": "var(--border-primary)",
        "theme-border-secondary": "var(--border-secondary)",
      },
      boxShadow: {
        "theme-sm": "var(--shadow-sm)",
        "theme-md": "var(--shadow-md)",
        "theme-lg": "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};
