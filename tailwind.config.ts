import { heroui } from "@heroui/theme";

const tailwindConfig = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    './src/app/**/*.tsx',
    './src/features/**/*.tsx',
    './src/components/**/*.tsx',
  ],
  theme: {
    extend: {
      colors: {
        airline: {
          canvas: '#f4f2ee',
          paper: '#fffefa',
          ink: '#162536',
          night: '#17283b',
          forest: '#183d37',
          'forest-soft': '#e8f0ec',
          garnet: '#86233d',
          gold: '#c4a466',
          line: '#e8e0d3',
          muted: '#68756e',
        },
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
      },
      keyframes: {
        'soft-rise': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gentle-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(-4deg)' },
          '50%': { transform: 'translateY(-9px) rotate(-1deg)' },
        },
        'flight-trace': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(18px, -10px)' },
        },
        'soft-glow': {
          '0%, 100%': { opacity: '.45', transform: 'scale(.96)' },
          '50%': { opacity: '.8', transform: 'scale(1.04)' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        'route-enter': {
          '0%': { opacity: '.34', transform: 'translate3d(28px, 5px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        'soft-rise': 'soft-rise 700ms cubic-bezier(0.2, 0.75, 0.25, 1) both',
        'gentle-float': 'gentle-float 6s ease-in-out infinite',
        'flight-trace': 'flight-trace 7s ease-in-out infinite',
        'soft-glow': 'soft-glow 5s ease-in-out infinite',
        'skeleton-shimmer': 'skeleton-shimmer 1.6s linear infinite',
        'route-enter': 'route-enter 440ms cubic-bezier(0.22, 0.75, 0.22, 1)',
      },
      margin: {
        '30': '7.50rem',
      },
    },
  },
  compilerOptions: {
    allowJs: true,
    esModuleInterop: true
  },
  darkMode: 'class',
  plugins: [
    heroui({
      prefix: 'nextui', 
      addCommonColors: false, 
      defaultTheme: 'light', 
      defaultExtendTheme: 'light',
      themes: {
        light: {
          layout: {
            radius: {},
          }, 
          colors: {
            default: {
              DEFAULT: '#E7EAF3',
              500: '#71717A',
            },
            primary: {
              DEFAULT: '#008060',
              500: '#06C5951A',
              foreground: '#ffffff',
            },
            secondary: {
              DEFAULT: '#51596C',
              foreground: '#ffffff',
            },
            success: {
              DEFAULT: '#077C76',
              foreground: '#ffffff',
            },
            warning: {
              DEFAULT: '#F1B980',
              foreground: '#ffffff',
            },
            danger: {
              DEFAULT: '#ee6a5f',
              500: '#cc648f',
              foreground: '#ffffff',
            },
            overlay: {
              DEFAULT: '#000000',
            },
          }, 
        },
        dark: {
          layout: {}, 
          colors: {
            primary: {  DEFAULT: '#008060', foreground: '#ffffff' },
            secondary: { DEFAULT: '#51596C', foreground: '#ffffff' },
            success: { DEFAULT: '#077C76', foreground: '#ffffff' },
            warning: { DEFAULT: '#F1B980', foreground: '#ffffff' },
            danger: { DEFAULT: '#692340', foreground: '#ffffff' },
          }, 
        },
      },
    }),
  ],
};

export default tailwindConfig;

