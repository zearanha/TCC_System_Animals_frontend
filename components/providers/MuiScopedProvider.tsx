import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { muiTheme } from "@/src/theme";

interface MuiScopedProviderProps {
  children: ReactNode;
}

export function MuiScopedProvider({ children }: MuiScopedProviderProps) {
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
