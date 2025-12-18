/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#667eea',
                    light: '#818cf8',
                    dark: '#5145cd',
                },
                secondary: {
                    DEFAULT: '#764ba2',
                    light: '#9333ea',
                    dark: '#6b21a8',
                },
                accent: {
                    pink: '#f472b6',
                    purple: '#c084fc',
                    blue: '#60a5fa',
                    green: '#34d399',
                    yellow: '#fb bf24',
                    orange: '#fb923c',
                },
                success: '#10b981',
                danger: '#ef4444',
                warning: '#f59e0b',
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(102, 126, 234, 0.5)',
                'glow-lg': '0 0 40px rgba(102, 126, 234, 0.6)',
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
                'pulse-slow': 'pulse 3s infinite',
            },
        },
    },
    plugins: [],
}
