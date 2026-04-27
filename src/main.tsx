import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./App";
import { chakraTheme, muiTheme } from "./theme";
import "@/app/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ChakraProvider theme={chakraTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </ThemeProvider>
  </React.StrictMode>
);
