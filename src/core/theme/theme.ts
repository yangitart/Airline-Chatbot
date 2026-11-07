import { createTheme } from "@mui/material/styles";

export const MATERIAL_THEME = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#86233d",
      light: "#f3e7eb",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#51596C",
      contrastText: "#ffffff",
    },
    success: {
      main: "#356859",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#b28a45",
      contrastText: "#ffffff",
    },
    error: {
      main: "#a92e3c",
      contrastText: "#ffffff",
    },
  },
});

export type APP_THEME_COLOR =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | undefined;

export type APP_THEME_VARIANT =
  | "shadow"
  | "bordered"
  | "solid"
  | "faded"
  | "ghost"
  | "light"
  | "flat";

export type APP_THEME_SIZE = "sm" | "md" | "lg";
