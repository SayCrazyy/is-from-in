module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./node_modules/@shadcn/ui/dist/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // or your preferred color
      },
    },
  },
  plugins: []
}