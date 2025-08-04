/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#007aff",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#5e5ce6",
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
        // Apple-like color palette
        apple: {
          blue: "#007aff",
          purple: "#5e5ce6",
          pink: "#ff2d92",
          red: "#ff3b30",
          orange: "#ff9500",
          yellow: "#ffcc00",
          green: "#34c759",
          teal: "#5ac8fa",
          indigo: "#5856d6",
          gray: {
            50: "#f9f9f9",
            100: "#f2f2f2",
            200: "#e5e5e5",
            300: "#d1d1d1",
            400: "#b0b0b0",
            500: "#8e8e93",
            600: "#636366",
            700: "#48484a",
            800: "#3a3a3c",
            900: "#1c1c1e",
          }
        },
        // Soft backgrounds for glassmorphism
        soft: {
          blue: "rgba(0, 122, 255, 0.1)",
          purple: "rgba(94, 92, 230, 0.1)",
          pink: "rgba(255, 45, 146, 0.1)",
          green: "rgba(52, 199, 89, 0.1)",
          orange: "rgba(255, 149, 0, 0.1)",
          yellow: "rgba(255, 204, 0, 0.1)",
          teal: "rgba(90, 200, 250, 0.1)",
          indigo: "rgba(88, 86, 214, 0.1)",
          gray: "rgba(142, 142, 147, 0.1)",
          white: "rgba(255, 255, 255, 0.8)",
          black: "rgba(0, 0, 0, 0.05)",
        }
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
      },
      boxShadow: {
        // Soft, layered shadows for depth
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'soft-md': '0 4px 16px 0 rgba(0, 0, 0, 0.06), 0 2px 8px 0 rgba(0, 0, 0, 0.12)',
        'soft-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.08), 0 4px 16px 0 rgba(0, 0, 0, 0.16)',
        'soft-xl': '0 16px 64px 0 rgba(0, 0, 0, 0.1), 0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        
        // Apple-style shadows
        'apple': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'apple-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'apple-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        
        // Glassmorphism shadows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-soft': '0 4px 16px 0 rgba(0, 0, 0, 0.1), 0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        'glass-strong': '0 16px 64px 0 rgba(31, 38, 135, 0.5), 0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        
        // Colored shadows for depth
        'blue': '0 4px 16px 0 rgba(0, 122, 255, 0.15), 0 2px 8px 0 rgba(0, 122, 255, 0.1)',
        'purple': '0 4px 16px 0 rgba(94, 92, 230, 0.15), 0 2px 8px 0 rgba(94, 92, 230, 0.1)',
        'green': '0 4px 16px 0 rgba(52, 199, 89, 0.15), 0 2px 8px 0 rgba(52, 199, 89, 0.1)',
        'orange': '0 4px 16px 0 rgba(255, 149, 0, 0.15), 0 2px 8px 0 rgba(255, 149, 0, 0.1)',
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
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
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
        "glow": "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}

