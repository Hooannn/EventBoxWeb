import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {},
  fontFamily: {
    sans: ['"PT Sans"', "sans-serif"],
  },
};
export const darkMode = "class";
export const plugins = [
  heroui({
    prefix: "heroui", // prefix for themes variables
    addCommonColors: false, // override common colors (e.g. "blue", "green", "pink").
    defaultTheme: "light", // default theme from the themes object
    defaultExtendTheme: "light", // default theme to extend on custom themes
    layout: {}, // common layout tokens (applied to all themes)
    themes: {
      light: {
        layout: {}, // light theme layout tokens
        colors: {
          default: {
            50: "#FAFAFA",
            100: "#F5F5F5",
            200: "#EEEEEE",
            300: "#E0E0E0",
            400: "#BDBDBD",
            500: "#9E9E9E",
            600: "#757575",
            700: "#616161",
            800: "#424242",
            900: "#212121",
            foreground: "#333333",
            DEFAULT: "#9E9E9E",
          },
          primary: {
            50: "#E0E0E0",
            100: "#B3B3B3",
            200: "#808080",
            300: "#4D4D4D",
            400: "#262626",
            500: "#121212",
            600: "#0F0F0F",
            700: "#0C0C0C",
            800: "#0A0A0A",
            900: "#050505",
            foreground: "#FFFFFF",
            DEFAULT: "#121212",
          },
          secondary: {
            50: "#E8EAF6",
            100: "#C5CAE9",
            200: "#9FA8DA",
            300: "#7986CB",
            400: "#5C6BC0",
            500: "#2C3E50",
            600: "#283849",
            700: "#22303F",
            800: "#1D2835",
            900: "#141D26",
            foreground: "#FFFFFF",
            DEFAULT: "#2C3E50",
          },
          success: {
            50: "#E8F5E9",
            100: "#C8E6C9",
            200: "#A5D6A7",
            300: "#81C784",
            400: "#66BB6A",
            500: "#388E3C",
            600: "#328036",
            700: "#2B6F2F",
            800: "#255D28",
            900: "#1B3E1E",
            foreground: "#FFFFFF",
            DEFAULT: "#388E3C",
          },
          warning: {
            50: "#FFF8E1",
            100: "#FFECB3",
            200: "#FFE082",
            300: "#FFD54F",
            400: "#FFCA28",
            500: "#FFA000",
            600: "#E69100",
            700: "#D17F00",
            800: "#BC6D00",
            900: "#8D4D00",
            foreground: "#000000",
            DEFAULT: "#FFA000",
          },
          danger: {
            50: "#FFEBEE",
            100: "#FFCDD2",
            200: "#EF9A9A",
            300: "#E57373",
            400: "#EF5350",
            500: "#D32F2F",
            600: "#C62828",
            700: "#B71C1C",
            800: "#9E1A1A",
            900: "#801313",
            foreground: "#FFFFFF",
            DEFAULT: "#D32F2F",
          },
        }, // light theme colors
      },
      dark: {
        layout: {}, // dark theme layout tokens
        colors: {
          default: {
            50: "#212121",
            100: "#424242",
            200: "#616161",
            300: "#757575",
            400: "#9E9E9E",
            500: "#BDBDBD",
            600: "#E0E0E0",
            700: "#EEEEEE",
            800: "#F5F5F5",
            900: "#FAFAFA",
            foreground: "#FAFAFA",
            DEFAULT: "#BDBDBD",
          },
          primary: {
            50: "#050505",
            100: "#0A0A0A",
            200: "#0C0C0C",
            300: "#0F0F0F",
            400: "#121212", // Primary color
            500: "#262626",
            600: "#4D4D4D",
            700: "#808080",
            800: "#B3B3B3",
            900: "#E0E0E0",
            foreground: "#E0E0E0",
            DEFAULT: "#121212",
          },
          secondary: {
            50: "#141D26",
            100: "#1D2835",
            200: "#22303F",
            300: "#283849",
            400: "#2C3E50", // Secondary color
            500: "#5C6BC0",
            600: "#7986CB",
            700: "#9FA8DA",
            800: "#C5CAE9",
            900: "#E8EAF6",
            foreground: "#E8EAF6",
            DEFAULT: "#2C3E50",
          },
          success: {
            50: "#1B3E1E",
            100: "#255D28",
            200: "#2B6F2F",
            300: "#328036",
            400: "#388E3C",
            500: "#66BB6A",
            600: "#81C784",
            700: "#A5D6A7",
            800: "#C8E6C9",
            900: "#E8F5E9",
            foreground: "#E8F5E9",
            DEFAULT: "#388E3C",
          },
          warning: {
            50: "#8D4D00",
            100: "#BC6D00",
            200: "#D17F00",
            300: "#E69100",
            400: "#FFA000",
            500: "#FFCA28",
            600: "#FFD54F",
            700: "#FFE082",
            800: "#FFECB3",
            900: "#FFF8E1",
            foreground: "#000000",
            DEFAULT: "#FFA000",
          },
          danger: {
            50: "#801313",
            100: "#9E1A1A",
            200: "#B71C1C",
            300: "#C62828",
            400: "#D32F2F",
            500: "#EF5350",
            600: "#E57373",
            700: "#EF9A9A",
            800: "#FFCDD2",
            900: "#FFEBEE",
            foreground: "#FFEBEE",
            DEFAULT: "#D32F2F",
          },
        }, // dark theme colors
      },
      // ... custom themes
    },
  }),
];
