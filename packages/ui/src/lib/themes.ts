export interface ThemeCssVars {
  chartLabel: string;
  chartGrid: string;
}

export interface ThemeConfig {
  light: ThemeCssVars;
  dark: ThemeCssVars;
}

export const theme: ThemeConfig = {
  light: {
    chartLabel: "215 16% 47%",
    chartGrid: "214 32% 91%",
  },
  dark: {
    chartLabel: "215 20% 65%",
    chartGrid: "217 33% 25%",
  },
};
