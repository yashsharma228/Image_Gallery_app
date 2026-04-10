module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0f172a', // dark background
          900: '#1e293b', // card background
        },
        accent: {
          gradient1: '#2563eb', // blue
          gradient2: '#a21caf', // purple
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
