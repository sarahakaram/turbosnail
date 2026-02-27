import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nature-forward palette
        earth: {
          50: '#faf7f2',
          100: '#f0ebe0',
          200: '#e0d5c0',
          300: '#c9b896',
          400: '#b39b6e',
          500: '#a08556',
          600: '#8a6d45',
          700: '#71563a',
          800: '#5e4733',
          900: '#4e3c2e',
        },
        forest: {
          50: '#f0f7f1',
          100: '#dcedde',
          200: '#bbdbc0',
          300: '#8ec298',
          400: '#5ea56d',
          500: '#3d8951',
          600: '#2c6e3f',
          700: '#245834',
          800: '#1f472b',
          900: '#1a3b24',
        },
        moss: {
          50: '#f4f7f0',
          100: '#e6eddc',
          200: '#cddcbc',
          300: '#aac48f',
          400: '#87a968',
          500: '#698d4b',
          600: '#517038',
          700: '#40572e',
          800: '#354728',
          900: '#2d3c23',
        },
        bark: {
          50: '#f8f5f1',
          100: '#ede7dd',
          200: '#dbd0be',
          300: '#c4b397',
          400: '#b09a77',
          500: '#a18662',
          600: '#947356',
          700: '#7b5d48',
          800: '#654d3f',
          900: '#534135',
        },
        // Species accent colors
        baobab: '#5B7553',
        mangrove: '#2A9D8F',
        bamboo: '#E9C46A',
        strangler: '#8B5E3C',
        willow: '#A78BFA',
        oak: '#6B7280',
        aspen: '#F4A261',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
