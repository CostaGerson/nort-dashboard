import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: '#FF6B35',
        'accent-hover': '#E85A2A',
        ink: '#1A1A1A',
        cream: '#F5F3EF',
        'soft-gray': '#E8E6E1',
        'mid-gray': '#9B9A95',
      },
      borderRadius: {
        card: '24px',
        soft: '16px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.08)',
        'glass-hover': '0 12px 40px rgba(0,0,0,0.12)',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
