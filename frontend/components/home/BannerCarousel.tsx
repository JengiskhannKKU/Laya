"use client";

import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion, AnimatePresence } from "framer-motion";
import { banners } from "@/lib/mock-data";
import Image from "next/image";

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  if (!banners || banners.length === 0) return null;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % banners.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      sx={{ py: 1 }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: { xs: "20px", md: "28px" },
          overflow: "hidden",
          height: { xs: 200, md: 440 },
          boxShadow: "0 20px 50px rgba(27,42,74,0.16)",
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Image
              src={banners[current].image}
              alt={banners[current].title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg, rgba(15,26,48,0.72) 0%, rgba(15,26,48,0.32) 45%, rgba(15,26,48,0.05) 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                px: { xs: 3, md: 7 },
              }}
            >
              <Box sx={{ maxWidth: { xs: "80%", md: "58%" } }}>
                <Typography
                  sx={{
                    fontFamily: '"Kanit", sans-serif',
                    fontWeight: 600,
                    fontSize: "0.6rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#D4BA7A",
                    mb: { xs: 1, md: 1.5 },
                  }}
                >
                  Featured Collection
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Kanit", sans-serif',
                    fontWeight: 700,
                    fontSize: { xs: "1.35rem", md: "2.6rem" },
                    color: "#FFFFFF",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                    textShadow: "0 2px 16px rgba(0,0,0,0.35)",
                  }}
                >
                  {banners[current].title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Kanit", sans-serif',
                    fontWeight: 300,
                    fontSize: { xs: "0.78rem", md: "1rem" },
                    color: "rgba(255,255,255,0.85)",
                    mt: { xs: 1, md: 1.5 },
                    whiteSpace: "pre-line",
                    lineHeight: 1.6,
                  }}
                >
                  {banners[current].subtitle}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <Box
          sx={{
            position: "absolute",
            bottom: 14,
            left: 20,
            display: "flex",
            gap: 0.6,
          }}
        >
          {banners.map((_, index) => (
            <Box
              key={index}
              onClick={() => {
                setDirection(index > current ? 1 : -1);
                setCurrent(index);
              }}
              component={motion.div}
              animate={{
                width: index === current ? 22 : 6,
                backgroundColor:
                  index === current ? "#FFFFFF" : "rgba(255,255,255,0.45)",
              }}
              transition={{ duration: 0.3 }}
              sx={{
                height: 6,
                borderRadius: 3,
                cursor: "pointer",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
