/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind WHERE our React components live so it can include the right CSS classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Our custom color palette — consistent across the entire app
      colors: {
        deep:    '#020B18',   // Darkest background (space black)
        surface: '#0A1628',   // Card backgrounds
        glass:   '#0D1E36',   // Elevated cards
        cyan:    '#00D4FF',   // Primary accent
        amber:   '#FFAB00',   // Warning / medium priority
        danger:  '#FF4560',   // Critical alerts
        success: '#00E676',   // Resolved / safe
        violet:  '#7B61FF',   // Secondary accent
      },
      fontFamily: {
        // Rajdhani = bold, technical headings (like a command center)
        // Outfit   = clean, readable body text
        heading: ['Rajdhani', 'sans-serif'],
        body:    ['Outfit',   'sans-serif'],
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':       'float 6s ease-in-out infinite',
        'scanline':    'scanline 8s linear infinite',
        'glow-pulse':  'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)'  },
          '50%':       { transform: 'translateY(-8px)' },
        },
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,212,255,0.3)'  },
          '50%':       { boxShadow: '0 0 20px rgba(0,212,255,0.8)' },
        },
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}


