/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'), // Load daisyUI plugin
    require('@tailwindcss/typography'), // Load Tailwind Typography plugin
  ],

  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#22C0BD",
          "secondary": "#737878",
          "accent": "#E7E7E7",
          "neutral": "#043130",
          "base-100": "#043130",
          "info": "#22C0BD",
          "success": "#248100",
          "warning": "#facc15",
          "error": "#dc2626",
        },
        light: {
          "primary": "#22C0BD",
          "secondary": "#737878",
          "accent": "#043130",
          "neutral": "#E7E7E7", // Fixed missing "#" in the hex color code
          "base-100": "#E7E7E7",
          "info": "#22C0BD",
          "success": "#248100",
          "warning": "#facc15",
          "error": "#dc2626",
        },
      },
    ],
    // Configuration options
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
}
