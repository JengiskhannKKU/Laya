"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  shopReply: string | null;
  shopReplyAt: string | null;
  createdAt: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <Box sx={{ display: "flex", gap: 0.25 }}>
      {Array.from({ length: 5 }, (_, i) =>
        i < rating
          ? <StarRoundedIcon key={i} sx={{ fontSize: 18, color: "#C5A55A" }} />
          : <StarBorderRoundedIcon key={i} sx={{ fontSize: 18, color: "#D1D5DB" }} />
      )}
    </Box>
  );
}

function formatThaiDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}

export default function MerchantReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`${API_BASE}/api/reviews/shop/mine`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "โหลดรีวิวไม่สำเร็จ");
        if (!cancelled) setReviews(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดรีวิวไม่สำเร็จ"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const submitReply = async (reviewId: string) => {
    const reply = (replyDrafts[reviewId] ?? "").trim();
    if (!reply) return;
    setSubmittingId(reviewId);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/reviews/${reviewId}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ตอบกลับไม่สำเร็จ");
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, shopReply: data.shopReply, shopReplyAt: new Date().toISOString() } : r)));
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ตอบกลับไม่สำเร็จ");
    } finally {
      setSubmittingId(null);
    }
  };

  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A" }}>
          รีวิวร้านค้า
        </Typography>
        {reviews.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Stars rating={Math.round(avgRating)} />
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: "#1B2A4A", fontSize: "0.95rem" }}>
              {avgRating.toFixed(1)}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#6B7280" }}>
              ({reviews.length} รีวิว)
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#C5A55A" }} />
        </Box>
      ) : reviews.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#9CA3AF" }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem" }}>ยังไม่มีรีวิว</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {reviews.map((review) => (
            <Card key={review.id} sx={{ border: "1px solid #E5DFD6", borderRadius: "14px", boxShadow: "none", p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: "#1B2A4A", fontSize: "0.9rem" }}>
                  {review.reviewerName}
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9CA3AF" }}>
                  {formatThaiDate(review.createdAt)}
                </Typography>
              </Box>
              <Stars rating={review.rating} />
              {review.comment && (
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#374151", mt: 1 }}>
                  {review.comment}
                </Typography>
              )}

              {review.shopReply ? (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "#F0EBE3", borderRadius: "10px" }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.78rem", color: "#1B2A4A", mb: 0.3 }}>
                    คำตอบจากร้าน
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", color: "#4B5563" }}>
                    {review.shopReply}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                  <TextField
                    size="small" fullWidth placeholder="ตอบกลับรีวิวนี้..."
                    value={replyDrafts[review.id] ?? ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: "10px", "& fieldset": { borderColor: "#E5DFD6" } } }}
                  />
                  <Button
                    onClick={() => submitReply(review.id)}
                    disabled={submittingId === review.id || !(replyDrafts[review.id] ?? "").trim()}
                    variant="contained"
                    sx={{ bgcolor: "#1B2A4A", borderRadius: "10px", fontFamily: FONT, textTransform: "none", flexShrink: 0 }}
                  >
                    {submittingId === review.id ? <CircularProgress size={18} color="inherit" /> : "ตอบกลับ"}
                  </Button>
                </Box>
              )}
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
