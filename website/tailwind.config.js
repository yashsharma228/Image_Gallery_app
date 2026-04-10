module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0f172a',
          900: '#1e293b',
        },
        accent: {
          gradient1: '#2563eb',
          gradient2: '#a21caf',
        },
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(90deg, #2563eb 0%, #a21caf 100%)',
      },
      boxShadow: {
        glass: '0 4px 32px 0 rgba(16, 18, 27, 0.15)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      transitionProperty: {
        spacing: 'margin, padding',
      },
    },
  },
  plugins: [],
}
