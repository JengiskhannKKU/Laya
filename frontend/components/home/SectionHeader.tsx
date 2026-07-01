"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  actionLabel?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  actionLabel = "ดูทั้งหมด",
}: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 2,
        mb: { xs: 2, md: 2.5 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C5A55A",
              mb: 0.75,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 700,
            fontSize: { xs: "1.3rem", md: "1.7rem" },
            color: "#1B2A4A",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: { xs: "0.78rem", md: "0.9rem" },
              color: "#7A7468",
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {href && (
        <Link href={href} style={{ textDecoration: "none", flexShrink: 0 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              position: "relative",
              pb: "3px",
              color: "#1B2A4A",
              "&:hover .laya-seeall-underline": { width: "100%" },
              "&:hover .laya-seeall-text": { color: "#C5A55A" },
            }}
          >
            <Typography
              className="laya-seeall-text"
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: { xs: "0.72rem", md: "0.8rem" },
                fontWeight: 400,
                letterSpacing: "0.04em",
                color: "#1B2A4A",
                whiteSpace: "nowrap",
                transition: "color 0.25s ease",
              }}
            >
              {actionLabel}
            </Typography>
            <Box
              className="laya-seeall-underline"
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: 0,
                height: "1px",
                bgcolor: "#C5A55A",
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Link>
      )}
    </Box>
  );
}
