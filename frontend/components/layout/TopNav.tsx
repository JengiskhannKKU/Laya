"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import LayaLogo from "@/components/common/LayaLogo";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { useTheme, useMediaQuery } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { useAuth } from "@/lib/auth-context";
import { useCartStore } from "@/lib/cart-store";
import { useNotifications } from "@/lib/notification-context";
import { useChat } from "@/lib/chat-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const NAV_BG = "#1B2A4A";

export default function AppTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const theme = useTheme();
  const isMobileMQ = useMediaQuery(theme.breakpoints.down("md"));
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const { unreadCount } = useNotifications();
  const { unreadCount: unreadChatCount } = useChat();
  const { locale, toggleLocale, t } = useLanguage();

  // หน้าแรกใช้ nav แบบ light editorial: โปร่งใสตอนอยู่บนสุด → glass ขาวเมื่อ scroll
  // หน้าอื่นใช้ navy: ทึบตอนอยู่บนสุด → glass navy เมื่อ scroll (glassmorphism ทุกหน้า)
  const light = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ชุดสีตาม variant — light (หน้าแรก) ตัวอักษร navy บนพื้นครีม/ขาว, navy (หน้าอื่น) ตามเดิม
  const NAV_ICON = light ? "#13284B" : "rgba(255,255,255,0.85)";
  const NAV_ICON_HOVER = light ? "rgba(19,40,75,0.07)" : "rgba(255,255,255,0.12)";
  const NAV_LINK = light ? "rgba(19,40,75,0.6)" : "rgba(255,255,255,0.65)";
  const NAV_LINK_ACTIVE = light ? "#13284B" : "#FFFFFF";
  const NAV_LINK_HOVER = light ? "#13284B" : "#FFFFFF";

  const navLinks = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.explore"), path: "/search" },
    { label: t("nav.categories"), path: "/category" },
    { label: t("nav.community"), path: "/community" },
    { label: t("nav.stories"), path: "/community/heritage" },
    { label: t("nav.services"), path: "/services" },
  ];

  useEffect(() => { setMounted(true); }, []);
  const isMobile = !mounted || isMobileMQ;
  // อ่านหลัง mount เท่านั้น — กัน hydration mismatch (ตะกร้าอยู่ใน localStorage)
  const cartCount = mounted ? cartItems.reduce((sum, i) => sum + i.quantity, 0) : 0;

  // เลือก nav link ที่ตรงกับ pathname มากที่สุด (path ยาวสุด) กันไฮไลต์ซ้อนกันตอน path ซ้อนกัน เช่น /community กับ /community/heritage
  const activeLinkPath = navLinks.reduce<string | null>((best, link) => {
    const base = link.path.split("?")[0];
    const matches = base === "/" ? pathname === "/" : pathname.startsWith(base);
    if (!matches) return best;
    if (!best || base.length > best.length) return base;
    return best;
  }, null);

  const isActive = (path: string) => path.split("?")[0] === activeLinkPath;

  return (
    <>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          // Glassmorphism: พื้นหลังโปร่งแสง + blur เมื่อ scroll — ที่บนสุดคงหน้าตาเดิม
          // (home โปร่งใส, หน้าอื่น navy ทึบ) เพื่อไม่เปลี่ยน layout/ความสูงใดๆ
          bgcolor: light
            ? scrolled
              ? "rgba(255,255,255,0.72)"
              : "transparent"
            : scrolled
              ? "rgba(27,42,74,0.78)"
              : NAV_BG,
          backdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
          boxShadow: light
            ? scrolled
              ? "0 1px 0 rgba(19,40,75,0.06), 0 8px 28px rgba(19,40,75,0.08)"
              : "none"
            : scrolled
              ? "0 1px 0 rgba(255,255,255,0.08), 0 8px 28px rgba(11,20,40,0.32)"
              : "0 1px 0 rgba(255,255,255,0.06)",
          height: 72,
          display: "flex",
          alignItems: "center",
          transition:
            "background-color 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease",
        }}
      >
        <Box
          sx={{
            maxWidth: 1440,
            width: "100%",
            mx: "auto",
            px: { xs: 2.5, sm: 3, md: 3, lg: 5 },
            display: "flex",
            alignItems: "center",
            height: "100%",
            gap: { md: 1, lg: 2 },
          }}
        >
          {/* Left: Wordmark */}
          <Box
            onClick={() => router.push("/")}
            sx={{
              width: { xs: "auto", md: 120, lg: 160 },
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <LayaLogo variant={light ? "navy" : "white"} height={28} priority />
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", "Georgia", serif',
                fontStyle: "italic",
                fontSize: "8.5px",
                color: "#C5A55A",
                letterSpacing: "0.13em",
                lineHeight: 1.2,
              }}
            >
              Every Pattern Tells a Story
            </Typography>
          </Box>

          {/* Center: Nav links (desktop only) */}
          {!isMobile && (
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: { md: "18px", lg: "40px" },
              }}
            >
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Box
                    key={link.path}
                    onClick={() => router.push(link.path)}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      pb: "4px",
                      "&:hover .laya-nav-underline": { width: "100%" },
                      "&:hover .laya-nav-text": { color: NAV_LINK_HOVER },
                    }}
                  >
                    <Typography
                      className="laya-nav-text"
                      sx={{
                        fontFamily: '"Kanit", sans-serif',
                        fontWeight: active ? 500 : 400,
                        fontSize: { md: "0.76rem", lg: "0.83rem" },
                        whiteSpace: "nowrap",
                        letterSpacing: "0.03em",
                        color: active ? NAV_LINK_ACTIVE : NAV_LINK,
                        transition: "color 0.25s ease",
                      }}
                    >
                      {link.label}
                    </Typography>
                    <Box
                      className="laya-nav-underline"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: active ? "100%" : 0,
                        height: "1px",
                        bgcolor: "#C5A55A",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Right: Actions */}
          <Box
            sx={{
              width: "auto",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: { xs: "2px", md: "4px" },
              ml: "auto",
            }}
          >
            {/* Search — desktop only */}
            {!isMobile && (
              <IconButton
                onClick={() => router.push("/search")}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "999px",
                  color: NAV_ICON,
                  "&:hover": { bgcolor: NAV_ICON_HOVER },
                }}
              >
                <SearchRoundedIcon fontSize="small" />
              </IconButton>
            )}

            {/* Wishlist — desktop only */}
            {!isMobile && (
              <IconButton
                onClick={() => router.push(user ? "/wishlist" : "/auth/login")}
                aria-label={t("nav.wishlist")}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "999px",
                  color: NAV_ICON,
                  "&:hover": { bgcolor: NAV_ICON_HOVER },
                }}
              >
                <FavoriteBorderRoundedIcon fontSize="small" />
              </IconButton>
            )}

            {/* Cart */}
            <IconButton
              onClick={() => router.push("/cart")}
              aria-label={t("nav.cart")}
              sx={{
                width: 36,
                height: 36,
                borderRadius: "999px",
                color: NAV_ICON,
                "&:hover": { bgcolor: NAV_ICON_HOVER },
              }}
            >
              <Badge
                badgeContent={mounted && user ? cartCount : 0}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#C5A55A",
                    color: "#1B2A4A",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    minWidth: 16,
                    height: 16,
                  },
                }}
              >
                <ShoppingCartRoundedIcon fontSize="small" />
              </Badge>
            </IconButton>

            {/* Messages — desktop only */}
            {!isMobile && (
              <IconButton
                onClick={() => router.push(user ? "/messages" : "/auth/login")}
                aria-label={t("nav.messages")}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "999px",
                  color: NAV_ICON,
                  "&:hover": { bgcolor: NAV_ICON_HOVER },
                }}
              >
                <Badge
                  badgeContent={mounted && user ? unreadChatCount : 0}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#C5A55A",
                      color: "#1B2A4A",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      minWidth: 16,
                      height: 16,
                    },
                  }}
                >
                  <ChatBubbleOutlineRoundedIcon fontSize="small" />
                </Badge>
              </IconButton>
            )}

            {/* Notifications — desktop only */}
            {!isMobile && (
              <IconButton
                onClick={() => router.push(user ? "/notifications" : "/auth/login")}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "999px",
                  color: NAV_ICON,
                  "&:hover": { bgcolor: NAV_ICON_HOVER },
                }}
              >
                <Badge
                  badgeContent={mounted && user ? unreadCount : 0}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#C5A55A",
                      color: "#1B2A4A",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      minWidth: 16,
                      height: 16,
                    },
                  }}
                >
                  <NotificationsNoneRoundedIcon fontSize="small" />
                </Badge>
              </IconButton>
            )}

            {/* Language toggle */}
            <Button
              onClick={toggleLocale}
              size="small"
              aria-label="Toggle language"
              sx={{
                minWidth: 0,
                width: 40,
                height: 30,
                flexShrink: 0,
                ml: { xs: 0.25, md: 0.75 },
                borderRadius: "999px",
                color: NAV_ICON,
                border: light
                  ? "1px solid rgba(19,40,75,0.22)"
                  : "1px solid rgba(255,255,255,0.2)",
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 600,
                fontSize: "0.68rem",
                letterSpacing: "0.02em",
                px: 0,
                textTransform: "none",
                "&:hover": {
                  bgcolor: NAV_ICON_HOVER,
                  borderColor: light ? "rgba(19,40,75,0.4)" : "rgba(255,255,255,0.35)",
                },
              }}
            >
              {locale === "th" ? "EN" : "TH"}
            </Button>

            {/* User */}
            {user ? (
              <Avatar
                onClick={() => router.push("/profile")}
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "rgba(197,165,90,0.2)",
                  border: "1.5px solid #C5A55A",
                  fontSize: "0.875rem",
                  fontFamily: '"Kanit", sans-serif',
                  color: "#C5A55A",
                  cursor: "pointer",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                {(user.email?.[0] ?? "U").toUpperCase()}
              </Avatar>
            ) : (
              <Button
                size="small"
                onClick={openAuthModal}
                sx={{
                  bgcolor: light ? "#13284B" : "transparent",
                  color: light ? "#FFFFFF" : "#C5A55A",
                  border: light ? "1px solid #13284B" : "1px solid rgba(197,165,90,0.5)",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 500,
                  px: 2,
                  py: 0.5,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  "&:hover": light
                    ? { bgcolor: "#0e1f3c", borderColor: "#0e1f3c" }
                    : {
                        bgcolor: "rgba(197,165,90,0.12)",
                        borderColor: "#C5A55A",
                      },
                }}
              >
                {t("nav.login")}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

    </>
  );
}
