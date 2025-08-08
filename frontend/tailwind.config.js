/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
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
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        ring: "rgb(var(--ring))",
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        primary: {
          DEFAULT: "rgb(var(--primary))",
          foreground: "rgb(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary))",
          foreground: "rgb(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "rgb(var(--health-error))",
          foreground: "rgb(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "rgb(var(--muted))",
          foreground: "rgb(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent))",
          foreground: "rgb(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "rgb(var(--popover))",
          foreground: "rgb(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "rgb(var(--card))",
          foreground: "rgb(var(--card-foreground))",
        },
        // Healthcare-specific color palette
        health: {
          success: "rgb(var(--health-success))",
          warning: "rgb(var(--health-warning))",
          error: "rgb(var(--health-error))",
          info: "rgb(var(--health-info))",
        },
        // Modern gray scale
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        xl: "var(--radius-lg)",
        "2xl": "var(--radius-xl)",
        "3xl": "2.5rem",
      },
      boxShadow: {
        // Modern healthcare shadows
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'soft-md': '0 4px 16px 0 rgba(0, 0, 0, 0.06), 0 2px 8px 0 rgba(0, 0, 0, 0.12)',
        'soft-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.08), 0 4px 16px 0 rgba(0, 0, 0, 0.16)',
        'soft-xl': '0 16px 64px 0 rgba(0, 0, 0, 0.1), 0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        
        // Healthcare-specific shadows
        'health': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'health-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'health-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'health-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        
        // Colored shadows for healthcare
        'blue': '0 4px 16px 0 rgba(0, 122, 255, 0.15), 0 2px 8px 0 rgba(0, 122, 255, 0.1)',
        'green': '0 4px 16px 0 rgba(52, 199, 89, 0.15), 0 2px 8px 0 rgba(52, 199, 89, 0.1)',
        'purple': '0 4px 16px 0 rgba(147, 51, 234, 0.15), 0 2px 8px 0 rgba(147, 51, 234, 0.1)',
        'orange': '0 4px 16px 0 rgba(255, 149, 0, 0.15), 0 2px 8px 0 rgba(255, 149, 0, 0.1)',
        'red': '0 4px 16px 0 rgba(255, 59, 48, 0.15), 0 2px 8px 0 rgba(255, 59, 48, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      backgroundOpacity: {
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
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
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "bounce": {
          "0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
          "40%, 43%": { transform: "translate3d(0, -8px, 0)" },
          "70%": { transform: "translate3d(0, -4px, 0)" },
          "90%": { transform: "translate3d(0, -2px, 0)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 122, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 122, 255, 0.6)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce": "bounce 1s infinite",
        "glow": "glow 2s ease-in-out infinite",
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['var(--font-size-xs)', { lineHeight: '1.4' }],
        'sm': ['var(--font-size-sm)', { lineHeight: '1.5' }],
        'base': ['var(--font-size-base)', { lineHeight: '1.6' }],
        'lg': ['var(--font-size-lg)', { lineHeight: '1.5' }],
        'xl': ['var(--font-size-xl)', { lineHeight: '1.4' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: '1.3' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: '1.2' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: '1.1' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: '1.1' }],
      },
    },
  },
  plugins: [],
}

