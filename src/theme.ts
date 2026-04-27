import { extendTheme } from "@chakra-ui/react";
import { createTheme } from "@mui/material/styles";

const colors = {
  brand: {
    50: "#f4f9f5",
    100: "#deecdf",
    200: "#bddac0",
    300: "#93c19a",
    400: "#6ba075",
    500: "#4f865b",
    600: "#3f6b48",
    700: "#34553b",
    800: "#2e4532",
    900: "#273a2b"
  },
  accent: {
    50: "#eefaf9",
    100: "#d4f2ef",
    200: "#ace4de",
    300: "#7ed0c8",
    400: "#53b5ad",
    500: "#3a9b95",
    600: "#307d79",
    700: "#2c6562",
    800: "#2a5150",
    900: "#254443"
  }
};

export const chakraTheme = extendTheme({
  colors,
  fonts: {
    heading: "Archivo, sans-serif",
    body: "Manrope, sans-serif"
  },
  styles: {
    global: {
      "html, body": {
        color: "#1d2c21",
        minHeight: "100%"
      }
    }
  }
});

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: colors.brand[600]
    },
    secondary: {
      main: colors.accent[500]
    },
    background: {
      default: "#edf4ef",
      paper: "#ffffff"
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: "Manrope, sans-serif",
    h1: { fontFamily: "Archivo, sans-serif" },
    h2: { fontFamily: "Archivo, sans-serif" },
    h3: { fontFamily: "Archivo, sans-serif" }
  }
});
