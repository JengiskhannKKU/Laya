import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

export default function OrderSuccessStep({ orderState }: any) {
  const { t } = useLanguage();
  return (
    <Box component={motion.div} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'center', pt: 8, pb: 4 }}>

      <Box
        component={motion.div}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        sx={{
          width: 96, height: 96, borderRadius: '50%', bgcolor: `${GOLD}1A`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 56, color: GOLD }} />
      </Box>

      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1.4rem', color: NAVY, textAlign: 'center' }}>
        {t("tailorFlow.headerTitles.success")}
      </Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: '#6B7280', textAlign: 'center', mt: -1.5 }}>
        {t("tailorFlow.success.subtitle")}
      </Typography>

      <Box sx={{ width: '100%', bgcolor: '#FFFFFF', p: 3, borderRadius: '18px', border: '1px solid #EFE9DD', boxShadow: '0 4px 20px rgba(27,42,74,0.06)', mt: 1.5 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, mb: 2, color: NAVY, fontSize: '0.95rem' }}>
          {t("tailorFlow.success.orderDetailsTitle")}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.85rem' }}>{t("tailorFlow.success.shop")}</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.85rem' }}>
              {orderState.shop?.name || t("tailorFlow.success.defaultShopName")}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.85rem' }}>{t("tailorFlow.success.price")}</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.85rem' }}>
              {orderState.shop?.price.toLocaleString() || "2,590"} {t("tailorFlow.orderSummary.baht")}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.85rem' }}>{t("tailorFlow.success.productionTime")}</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.85rem' }}>
              {t("tailorFlow.success.productionDuration")}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: '100%', bgcolor: `${NAVY}08`, p: 3, borderRadius: '18px', mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <LocalShippingRoundedIcon sx={{ color: GOLD, fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, fontSize: '0.88rem' }}>
            {t("tailorFlow.success.shipTitle")}
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: '#6B7280', mt: 0.3, lineHeight: 1.5 }}>
            {t("tailorFlow.success.shipDesc")}
          </Typography>
        </Box>
      </Box>

      <Link href="/" style={{ textDecoration: 'none', width: '100%', marginTop: '8px' }}>
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: NAVY,
            color: 'white',
            py: 1.7,
            borderRadius: '14px',
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: '0 4px 14px rgba(27,42,74,0.25)',
            '&:hover': { bgcolor: '#0F1A30' },
          }}
        >
          {t("tailorFlow.success.backHome")}
        </Button>
      </Link>

    </Box>
  );
}
