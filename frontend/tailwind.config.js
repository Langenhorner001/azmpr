/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                poppins: ['Poppins', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
                montserrat: ['Montserrat', 'sans-serif'],
                urdu: ["'Noto Nastaliq Urdu'", 'serif'],
                display: ["'Plus Jakarta Sans'", "'Poppins'", 'system-ui', 'sans-serif'],
                sans: ["'Plus Jakarta Sans'", "'Inter'", 'system-ui', 'sans-serif'],
            },
            colors: {
                gold: '#D4AF37',
                'gold-bright': '#FFD700',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'fade-in-up': {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'gold-pulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0)' },
                    '50%': { boxShadow: '0 0 20px 4px rgba(212,175,55,0.3)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'slide-in': {
                    from: { transform: 'translateX(-100%)', opacity: '0' },
                    to: { transform: 'translateX(0)', opacity: '1' },
                },
                'marquee': {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(calc(-100% - var(--gap)))' },
                },
                'border-spin': {
                    from: { transform: 'translate(-50%, -50%) rotate(0deg)' },
                    to: { transform: 'translate(-50%, -50%) rotate(360deg)' },
                },
                'shine': {
                    '0%': { left: '-40%' },
                    '55%, 100%': { left: '120%' },
                },
                'gradient-x': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'float': 'float 4s ease-in-out infinite',
                'fade-in-up': 'fade-in-up 0.7s ease-out forwards',
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'gold-pulse': 'gold-pulse 2s ease-in-out infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
                'slide-in': 'slide-in 0.3s ease-out',
                'marquee': 'marquee var(--duration, 40s) linear infinite',
                'border-spin': 'border-spin 6s linear infinite',
                'shine': 'shine 3.2s ease-in-out infinite',
                'gradient-x': 'gradient-x 6s ease infinite',
            },
        }
    },
    plugins: [require("tailwindcss-animate")],
};
