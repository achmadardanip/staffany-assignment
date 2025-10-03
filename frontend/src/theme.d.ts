import { Theme } from "@mui/material/styles";

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
