/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      rotate: {
        'y-180': '180deg',
      },
      fontSize: {
        root: '13px',
        xs: '0.75rem',     // 12px
        '2xs': '0.8125rem', // 13px
        '3xs': '0.875rem',  // 14px
        sm: '0.96rem',      // ~14.4px
        base: '0.96rem',      // 16px
        lg: '1.125rem',    // 18px
        xl: '1.25rem',     // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 30px
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1920px',  // 4K resolution width
        '2xl': '2560px', // You might want to keep this the same as xl
        '3xl': '3840px', // You might want to keep this the same as xl
      },
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
        krungthep: ['Krungthep', 'Arial', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {
      backfaceVisibility: ['responsive'],
      filter: ['theme-sakuraTrees'],
      invert: ['theme-sakuraTrees'],
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
      }
      addUtilities(newUtilities, ['responsive'])
    },
    function({ addBase, theme }) {
      addBase({
        'html': { fontSize: theme('fontSize.root') },
        '@screen sm': {
          'html': { fontSize: theme('fontSize.sm') },
        },
        '@screen md': {
          'html': { fontSize: theme('fontSize.md') },
        },
        '@screen lg': {
          'html': { fontSize: theme('fontSize.lg') },
        },
        '@screen xl': {
          'html': { fontSize: theme('fontSize.xl') },
        },
        '@screen 2xl': {
          'html': { fontSize: theme('fontSize.2xl') },
        },
        '@screen 3xl': {
          'html': { fontSize: theme('fontSize.3xl') },
        },
      })
    },
    require('tailwind-scrollbar'),
  ],
}
