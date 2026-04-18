import Box from "@mui/material/Box";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#FAF6F0",
        position: "relative",
      }}
    >
      <Box
        sx={{
          flex: 1,
          maxWidth: 430,
          mx: "auto",
          width: "100%",
          position: "relative",
          bgcolor: "#FFFFFF",
          boxShadow: { xs: "none", sm: "0 0 40px rgba(0,0,0,0.08)" },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
