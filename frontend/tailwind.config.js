/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    future: {
        hoverOnlyWhenSupported: true,
    },
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2e1065',
                },
                accent: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                    950: '#042f2e',
                },
                surface: {
                    50: 'rgba(255, 255, 255, 0.9)',
                    100: 'rgba(255, 255, 255, 0.8)',
                    200: 'rgba(255, 255, 255, 0.6)',
                    300: 'rgba(255, 255, 255, 0.4)',
                    400: 'rgba(255, 255, 255, 0.2)',
                    500: 'rgba(255, 255, 255, 0.1)',
                    dark: {
                        50: 'rgba(30, 27, 75, 0.9)',
                        100: 'rgba(30, 27, 75, 0.8)',
                        200: 'rgba(30, 27, 75, 0.6)',
                        300: 'rgba(30, 27, 75, 0.4)',
                        400: 'rgba(30, 27, 75, 0.2)',
                        500: 'rgba(30, 27, 75, 0.1)',
                    }
                }
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
                'neon': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 10px rgba(139, 92, 246, 0.2)',
                'neon-strong': '0 0 30px rgba(124, 58, 237, 0.5), 0 0 15px rgba(124, 58, 237, 0.3)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 3s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'shimmer': 'shimmer 2.5s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '100%': { transform: 'translateX(100%)' },
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'mesh-light': 'radial-gradient(at 0% 0%, rgba(221, 214, 254, 0.6) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(204, 251, 241, 0.6) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(221, 214, 254, 0.6) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(204, 251, 241, 0.6) 0px, transparent 50%)',
                'mesh-dark': 'radial-gradient(at 0% 0%, rgba(76, 29, 149, 0.3) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(19, 78, 74, 0.3) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(76, 29, 149, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(19, 78, 74, 0.3) 0px, transparent 50%)',
            }
        },
    },
    plugins: [],
}
