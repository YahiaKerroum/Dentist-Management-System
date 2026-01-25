/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom mint/seafoam color palette
                mint: {
                    50: '#E8F5F0',
                    100: '#D5F5E3',
                    200: '#D5EDE8',
                    300: '#A8E6CF',
                    400: '#7DD3C0',
                    500: '#3DBEA3',
                    600: '#2FA88E',
                    700: '#258A74',
                    800: '#1C6B5A',
                    900: '#134D41',
                },
            },
        },
    },
    plugins: [],
}
