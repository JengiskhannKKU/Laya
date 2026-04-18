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
      sx={{ px: 2.5, py: 1 }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          height: 190,
          boxShadow: "0 8px 24px rgba(27,42,74,0.12)",
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
                  "linear-gradient(to left, rgba(27,42,74,0.88) 35%, rgba(27,42,74,0.2) 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-end",
                px: 3,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  color: "#FFFFFF",
                  lineHeight: 1.35,
                  textAlign: "right",
                }}
              >
                {banners[current].title}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontWeight: 300,
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.8)",
                  mt: 0.8,
                  textAlign: "right",
                  whiteSpace: "pre-line",
                  lineHeight: 1.5,
                }}
              >
                {banners[current].subtitle}
              </Typography>
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
