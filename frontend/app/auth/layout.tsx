import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function BrandPanel() {
  return (
    <Box
      sx={{
        width: { md: "44%", lg: "46%" },
        display: { xs: "none", md: "flex" },
        bgcolor: "#1B2A4A",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "sticky",
        top: 0,
        height: "100vh",
        px: { md: 6, lg: 8 },
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Decorative SVG textile diamond pattern */}
      <Box sx={{ position: "absolute", inset: 0, opacity: 0.045, pointerEvents: "none" }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="textile" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <polygon points="20,2 38,20 20,38 2,20" fill="none" stroke="#C5A55A" strokeWidth="0.8"/>
              <polygon points="20,10 30,20 20,30 10,20" fill="none" stroke="#C5A55A" strokeWidth="0.5"/>
              <circle cx="20" cy="20" r="2" fill="#C5A55A"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#textile)"/>
        </svg>
      </Box>

      {/* Gold corner accent top-left */}
      <Box sx={{ position: "absolute", top: 32, left: 32, width: 32, height: 32, borderTop: "2px solid #C5A55A", borderLeft: "2px solid #C5A55A", opacity: 0.5 }} />
      <Box sx={{ position: "absolute", bottom: 32, right: 32, width: 32, height: 32, borderBottom: "2px solid #C5A55A", borderRight: "2px solid #C5A55A", opacity: 0.5 }} />

      {/* Logo */}
      <Typography
        sx={{
          fontFamily: '"Kanit", sans-serif',
          fontWeight: 800,
          fontSize: { md: "3rem", lg: "3.5rem" },
          color: "#FFFFFF",
          letterSpacing: "0.18em",
          mb: 0.5,
          position: "relative",
        }}
      >
        LAYA
      </Typography>

      {/* Gold underline */}
      <Box sx={{ width: 52, height: 2, bgcolor: "#C5A55A", mb: 2.5, position: "relative" }} />

      {/* Italic editorial tagline */}
      <Typography
        sx={{
          fontFamily: '"Cormorant Garamond", "Kanit", serif',
          fontStyle: "italic",
          fontSize: { md: "1.15rem", lg: "1.3rem" },
          color: "rgba(255,255,255,0.72)",
          textAlign: "center",
          lineHeight: 1.65,
          mb: 4.5,
          maxWidth: 280,
          position: "relative",
        }}
      >
        A Curated Heritage Collection
      </Typography>

      {/* Brand promises */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.6, position: "relative" }}>
        {[
          "ผ้าทอมือที่ได้รับการรับรองความแท้จริง",
          "ช่างทอฝีมือจากชุมชนทั่วไทย",
          "สินค้า GI มาตรฐานสากล",
        ].map((text) => (
          <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#C5A55A", flexShrink: 0 }} />
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.62)",
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              {text}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Bottom label */}
      <Typography
        sx={{
          position: "absolute",
          bottom: 36,
          fontFamily: '"Kanit", sans-serif',
          fontSize: "0.6rem",
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.2)",
          textTransform: "uppercase",
        }}
      >
        Thai Handcraft Heritage
      </Typography>
    </Box>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#FAF6F0" }}>
      <BrandPanel />

      {/* Form side */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: { xs: "flex-start", md: "center" },
          bgcolor: "#FAF6F0",
          overflowY: "auto",
          minHeight: "100vh",
          py: { md: 5 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 430, md: 480 },
            mx: "auto",
            bgcolor: "#FFFFFF",
            boxShadow: {
              xs: "none",
              sm: "0 4px 32px rgba(27,42,74,0.08)",
              md: "0 8px 48px rgba(27,42,74,0.12)",
            },
            borderRadius: { xs: 0, sm: "20px", md: "24px" },
            display: "flex",
            flexDirection: "column",
            minHeight: { xs: "100vh", sm: "auto" },
            overflow: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
