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
        'travel-wash': {
          from: { transform: 'translate3d(-5%, -3%, 0)' },
          to: { transform: 'translate3d(6%, 4%, 0)' },
        },
        'travel-wave': {
          from: { transform: 'translate(-48px, 18px) scaleY(0.85)' },
          to: { transform: 'translate(48px, -24px) scaleY(1.15)' },
        },
        'travel-bag-lift': {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '42%': { transform: 'translateY(-4px) rotate(-8deg)' },
          '72%': { transform: 'translateY(1px) rotate(2deg)' },
        },
        'travel-check-mark': {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' },
        },
        'travel-radar-sweep': {
          to: { transform: 'rotate(360deg)' },
        },
        'assistant-overlay-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'assistant-panel-in': {
          from: { opacity: '0', transform: 'translate3d(22px, 14px, 0) scale(0.985)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
        'assistant-panel-mobile-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'assistant-message-in': {
          from: { opacity: '0', transform: 'translateY(7px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'assistant-avatar-idle': {
          '0%, 100%': { transform: 'scale(1.025) translateY(1px) rotate(-0.25deg)' },
          '50%': { transform: 'scale(1.075) translateY(-1px) rotate(0.25deg)' },
        },
        'assistant-avatar-thinking': {
          '0%, 100%': { transform: 'scale(1.04) translateY(1px) rotate(-0.2deg)' },
          '50%': { transform: 'scale(1.1) translateY(-1.5px) rotate(0.2deg)' },
        },
        'assistant-processing-dot': {
          '0%, 60%, 100%': { opacity: '0.55', transform: 'translateY(0)' },
          '30%': { opacity: '1', transform: 'translateY(-3px)' },
        },
        'assistant-greeting-in': {
          from: { opacity: '0', transform: 'translateX(6px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        'assistant-greeting-out': {
          from: { opacity: '1', transform: 'translateX(0) scale(1)' },
          to: { opacity: '0', transform: 'translateX(5px) scale(0.98)' },
        },
      },
      animation: {
        'soft-rise': 'soft-rise 700ms cubic-bezier(0.2, 0.75, 0.25, 1) both',
        'gentle-float': 'gentle-float 6s ease-in-out infinite',
        'flight-trace': 'flight-trace 7s ease-in-out infinite',
        'soft-glow': 'soft-glow 5s ease-in-out infinite',
        'skeleton-shimmer': 'skeleton-shimmer 1.6s linear infinite',
        'route-enter': 'route-enter 440ms cubic-bezier(0.22, 0.75, 0.22, 1)',
        'travel-wash': 'travel-wash 18s ease-in-out infinite alternate',
        'travel-wave-far': 'travel-wave 12s ease-in-out infinite alternate',
        'travel-wave-near': 'travel-wave 16s -6s ease-in-out infinite alternate-reverse',
        'travel-bag-lift': 'travel-bag-lift 420ms ease-out',
        'travel-check-mark': 'travel-check-mark 360ms ease-out',
        'travel-radar-sweep': 'travel-radar-sweep 660ms ease-in-out',
        'assistant-overlay-in': 'assistant-overlay-in 180ms ease-out both',
        'assistant-panel-in': 'assistant-panel-in 280ms cubic-bezier(0.2, 0.75, 0.25, 1) both',
        'assistant-panel-mobile-in': 'assistant-panel-mobile-in 280ms cubic-bezier(0.2, 0.75, 0.25, 1) both',
        'assistant-message-in': 'assistant-message-in 230ms ease-out both',
        'assistant-avatar-idle': 'assistant-avatar-idle 5.2s ease-in-out infinite',
        'assistant-avatar-thinking': 'assistant-avatar-thinking 1.8s ease-in-out infinite',
        'assistant-processing-dot': 'assistant-processing-dot 1.3s ease-in-out infinite',
        'assistant-greeting-in': 'assistant-greeting-in 180ms ease-out both',
        'assistant-greeting-out': 'assistant-greeting-out 220ms ease-in both',
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

