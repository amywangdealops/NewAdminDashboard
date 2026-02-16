/**
 * E&W Brand — Tailwind CSS Preset
 * Version 1.0.0
 *
 * USAGE (tailwind.config.js):
 *   import ewBrand from './ew-brand-tokens/tailwind-preset.js'
 *   export default {
 *     presets: [ewBrand],
 *     // ...your config
 *   }
 *
 * Or for Tailwind v4 (CSS-based config), use ew-brand.css instead.
 */

export default {
  theme: {
    extend: {
      colors: {
        // Core
        primary: {
          DEFAULT: '#1a1a1a',
          hover: '#333333',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#CFCCAE',
          foreground: '#1a1a1a',
        },
        background: '#f7f7f5',
        foreground: '#1a1a1a',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
        secondary: {
          DEFAULT: '#f0efe9',
          foreground: '#1a1a1a',
        },
        muted: {
          DEFAULT: '#f0efe9',
          foreground: '#666666',
        },
        border: '#e2e0d8',
        'border-subtle': '#eeede7',
        input: {
          DEFAULT: 'transparent',
          background: '#f5f4f0',
        },
        destructive: {
          DEFAULT: '#c53030',
          foreground: '#ffffff',
        },
        ring: '#1a1a1a',

        // Text hierarchy
        'text-primary': '#1a1a1a',
        'text-secondary': '#666666',
        'text-tertiary': '#999891',
        'text-muted': '#aaaaaa',

        // Chart palette
        chart: {
          1: '#7c9885',
          2: '#b8c5a2',
          3: '#CFCCAE',
          4: '#8fa5b2',
          5: '#a3927e',
        },
      },

      fontFamily: {
        heading: ["'DM Serif Display'", 'Georgia', "'Times New Roman'", 'serif'],
        sans: ["'Inter'", 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },

      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },

      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.03)',
        sm: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        md: '0 4px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)',
      },
    },
  },
}
