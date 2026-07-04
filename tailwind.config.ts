import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './_pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2d5016',
          light: '#4a7c2f',
          pale: '#eaf2e3',
        },
        accent: {
          DEFAULT: '#c9a84c',
          light: '#e8c96a',
          pale: '#fbf5e0',
        },
        brand: {
          dark: '#1a1a1a',
          grey: '#6b7280',
          light: '#f9fafb',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', '"Helvetica Neue"', 'sans-serif'],
        accent: ['"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
