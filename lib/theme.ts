import { createTheme } from "@mui/material/styles";

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
      dark: "#A68A3A",
      contrastText: "#1B2A4A",
    },
    background: {
      default: "#FAF6F0",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1B2A4A",
      secondary: "#6B7280",
    },
  },
  typography: {
    fontFamily: '"Noto Serif Thai", "Playfair Display", serif',
    h1: {
      fontFamily: '"Playfair Display", "Noto Serif Thai", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", "Noto Serif Thai", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Playfair Display", "Noto Serif Thai", serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Noto Serif Thai", "Playfair Display", serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Noto Serif Thai", "Playfair Display", serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Noto Serif Thai", "Playfair Display", serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"Noto Serif Thai", "Playfair Display", serif',
    },
    body2: {
      fontFamily: '"Noto Serif Thai", "Playfair Display", serif',
    },
    button: {
      fontFamily: '"Noto Serif Thai", "Playfair Display", serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
  },
});

export default theme;
