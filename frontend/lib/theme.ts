import { createTheme } from "@mui/material/styles";

const KANIT = '"Kanit", sans-serif';

const theme = createTheme({
  palette: {
    primary: {
      main: "#1B2A4A",
      light: "#2C3E6B",
      dark: "#0F1A30",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#C5A55A",
      light: "#D4BA7A",
      dark: "#9C7E37",
      contrastText: "#1B2A4A",
    },
    background: {
      default: "#FAF6F0",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1B2A4A",
      secondary: "#4A5468",
    },
  },
  typography: {
    fontFamily: KANIT,
    h1: { fontFamily: KANIT, fontWeight: 700 },
    h2: { fontFamily: KANIT, fontWeight: 600 },
    h3: { fontFamily: KANIT, fontWeight: 600 },
    h4: { fontFamily: KANIT, fontWeight: 700 },
    h5: { fontFamily: KANIT, fontWeight: 600 },
    h6: { fontFamily: KANIT, fontWeight: 600 },
    body1: { fontFamily: KANIT },
    body2: { fontFamily: KANIT },
    button: { fontFamily: KANIT, fontWeight: 600 },
    caption: { fontFamily: KANIT },
    overline: { fontFamily: KANIT },
    subtitle1: { fontFamily: KANIT },
    subtitle2: { fontFamily: KANIT },
  },
  shape: { borderRadius: 12 },
  shadows: [
    "none",
    "0 2px 6px rgba(27,42,74,0.05)",
    "0 2px 8px rgba(27,42,74,0.06)",
    "0 4px 12px rgba(27,42,74,0.08)",
    "0 4px 12px rgba(27,42,74,0.08)",
    "0 8px 24px rgba(27,42,74,0.12)",
    "0 8px 24px rgba(27,42,74,0.12)",
    "0 8px 24px rgba(27,42,74,0.12)",
    "0 8px 24px rgba(27,42,74,0.12)",
    "0 8px 24px rgba(27,42,74,0.12)",
    "0 8px 24px rgba(27,42,74,0.12)",
    "0 8px 24px rgba(27,42,74,0.12)",
    "0 8px 24px rgba(27,42,74,0.12)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
    "0 20px 40px rgba(27,42,74,0.18)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          fontWeight: 600,
          fontFamily: KANIT,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(27,42,74,0.08)",
          border: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#C5A55A",
            },
          },
          "& label.Mui-focused": {
            color: "#C5A55A",
          },
        },
      },
    },
  },
});

export default theme;
