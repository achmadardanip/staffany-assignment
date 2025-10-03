import { createTheme } from "@mui/material/styles";
import { STAFFANY_NAVY, STAFFANY_RED, STAFFANY_TURQOISE } from "./colors";

declare module "@mui/material/styles" {
  interface Theme {
    customColors: {
      navy: string;
      red: string;
      turquoise: string;
    };
  }
  interface ThemeOptions {
    customColors?: {
      navy: string;
      red: string;
      turquoise: string;
    };
  }
}

export const staffanyTheme = createTheme({
  palette: {
    primary: {
      main: STAFFANY_NAVY,
    },
    secondary: {
      main: STAFFANY_RED,
      contrastText: "white",
    },
    error: {
      main: STAFFANY_RED,
    },
    success: {
      main: STAFFANY_TURQOISE,
    },
  },
  customColors: {
    navy: STAFFANY_NAVY,
    red: STAFFANY_RED,
    turquoise: STAFFANY_TURQOISE,
  },
});
