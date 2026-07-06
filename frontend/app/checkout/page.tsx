"use client";

import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { QRCodeSVG } from "qrcode.react";
import { generatePromptPayPayload, PROMPTPAY_ID, formatPromptPayIdDisplay } from "@/lib/promptpay";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { initialMockCartItems, mockAddresses, mockShippingOptions } from "@/lib/mock-data";
import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor: "#FFFFFF",
    "& fieldset": { borderColor: "#E5DFD6" },
    "&:hover fieldset": { borderColor: "#C5A55A" },
    "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
  },
};

const STEPS = ["Address", "Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  
  // Data States
  const [selectedAddressId, setSelectedAddressId] = useState(mockAddresses[0]?.id || "");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ recipientName: "", phone: "", addressLine1: "", subdistrict: "", district: "", province: "กรุงเทพมหานคร", postalCode: "" });
  const [postalError, setPostalError] = useState("");

  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("promptpay");
  const [noteToSeller, setNoteToSeller] = useState("");

  const [timeLeft, setTimeLeft] = useState(900); // 15 mins for PromptPay
  const [isProcessing, setIsProcessing] = useState(false);

  // Cart logic
  const items = useMemo(() => initialMockCartItems.filter(i => !i.savedForLater), []);
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [items]);
  const shippingCost = mockShippingOptions.find(o => o.id === selectedShippingId)?.cost || 0;
  const total = subtotal + shippingCost; // Mock: without coupon

  // PromptPay QR payload — dynamic QR ตามยอดสั่งซื้อจริง (US-604)
  const qrPayload = useMemo(
    () => (total > 0 ? generatePromptPayPayload(PROMPTPAY_ID, total) : ""),
    [total]
  );

  // PromptPay Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === 2 && selectedPayment === "promptpay" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, selectedPayment, timeLeft]);

  const handleNextStep = () => {
    // Validate Step 1
    if (currentStep === 0) {
      if (isAddingNewAddress) {
        if (!newAddress.recipientName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.subdistrict || !newAddress.district || !newAddress.postalCode) {
          alert("กรุณากรอกข้อมูลให้ครบถ้วน");
          return;
        }
        if (newAddress.postalCode.length !== 5) {
          setPostalError("รหัสไปรษณีย์ต้องมี 5 หลัก");
          return;
        }
        setPostalError("");
        setIsAddingNewAddress(false);
        // Simulate adding (could push to mock array, but here we just mock selection)
        // For prototype, just treat validation passed
      } else if (!selectedAddressId) {
        alert("กรุณาเลือกที่อยู่จัดส่ง");
        return;
      }
    }
    // Validate Step 2
    if (currentStep === 1 && !selectedShippingId) {
      alert("กรุณาเลือกวิธีการจัดส่ง");
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Process Order
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        router.push("/orders/mock-123/success");
      }, 3000);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
    else router.back();
  };

  if (!user) {
    if (typeof window !== "undefined") router.push("/auth/login");
    return null;
  }

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh", position: "relative" }}>
        
        {/* Processing Overlay */}
        {isProcessing && (
          <Box sx={{ position: "fixed", inset: 0, zIndex: 9999, bgcolor: "rgba(250, 246, 240, 0.9)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress sx={{ color: "#1B2A4A", mb: 3 }} size={48} />
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A" }}>
              กำลังดำเนินการ...
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", mt: 1 }}>
              กรุณารอสักครู่ ห้ามปิดหน้านี้
            </Typography>
          </Box>
        )}

        {/* Header */}
        <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #E5DFD6" }}>
          <IconButton onClick={handleBackStep} sx={{ color: "#1B2A4A" }}>
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ flex: 1, textAlign: "center", fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A", mr: 4 }}>
            ชำระเงิน
          </Typography>
        </Box>

        {/* Step Indicators */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: 3, pt: 3, pb: 2 }}>
          {STEPS.map((step, idx) => (
            <Box key={step} sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                bgcolor: currentStep >= idx ? "#1B2A4A" : "#E5DFD6",
                color: currentStep >= idx ? "#FFFFFF" : "#9CA3AF",
                fontWeight: 700, fontSize: "0.85rem", transition: "all 0.3s"
              }}>
                {idx + 1}
              </Box>
              {idx < STEPS.length - 1 && (
                <Box sx={{ width: 30, height: 2, bgcolor: currentStep > idx ? "#1B2A4A" : "#E5DFD6", mx: 0.5, transition: "all 0.3s" }} />
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ px: 2, pt: 2, pb: 12 }}>
          
          {/* STEP 1: Address */}
          {currentStep === 0 && (
            <Box>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2, display: "flex", alignItems: "center" }}>
                <LocationOnOutlinedIcon sx={{ mr: 1, fontSize: 22, color: "#C5A55A" }} /> ที่อยู่สำหรับการจัดส่ง
              </Typography>
              
              {!isAddingNewAddress ? (
                <>
                  <RadioGroup value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                    {mockAddresses.map((addr) => (
                      <Box key={addr.id} sx={{ bgcolor: "#FFFFFF", borderRadius: "12px", p: 2, mb: 1.5, border: selectedAddressId === addr.id ? "2px solid #C5A55A" : "1px solid #E5DFD6" }}>
                        <FormControlLabel
                          value={addr.id}
                          control={<Radio sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#C5A55A" } }} />}
                          label={
                            <Box sx={{ ml: 1 }}>
                              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A" }}>
                                {addr.recipientName} {addr.isDefault && <Box component="span" sx={{ bgcolor: "#FDF8F0", color: "#8E601C", px: 1, py: 0.2, borderRadius: "8px", fontSize: "0.7rem", ml: 1 }}>ค่าเริ่มต้น</Box>}
                              </Typography>
                              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mt: 0.5 }}>
                                {addr.phone}
                              </Typography>
                              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mt: 0.2 }}>
                                {addr.addressLine1} {addr.addressLine2} {addr.subdistrict} {addr.district} {addr.province} {addr.postalCode}
                              </Typography>
                            </Box>
                          }
                          sx={{ alignItems: "flex-start", m: 0 }}
                        />
                      </Box>
                    ))}
                  </RadioGroup>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => setIsAddingNewAddress(true)}
                    sx={{
                      borderRadius: "12px", py: 1.5, mt: 1, borderColor: "#E5DFD6", color: "#1B2A4A", fontFamily: '"Kanit", sans-serif',
                      "&:hover": { borderColor: "#C5A55A", bgcolor: "#FDF8F0" }
                    }}
                  >
                    เพิ่มที่อยู่ใหม่
                  </Button>
                </>
              ) : (
                <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "12px", p: 2, border: "1px solid #E5DFD6" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField size="small" placeholder="ชื่อ-นามสกุล ผู้รับ" sx={textFieldStyles} required value={newAddress.recipientName} onChange={e => setNewAddress({...newAddress, recipientName: e.target.value})} />
                    <TextField size="small" placeholder="เบอร์โทรศัพท์ (10 หลัก)" inputProps={{ maxLength: 10 }} sx={textFieldStyles} required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                    <TextField size="small" placeholder="รายละเอียดที่อยู่ (บ้านเลขที่, ซอย, ถนน)" sx={textFieldStyles} required value={newAddress.addressLine1} onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})} />
                    
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                      <TextField size="small" placeholder="แขวง/ตำบล" sx={textFieldStyles} required value={newAddress.subdistrict} onChange={e => setNewAddress({...newAddress, subdistrict: e.target.value})} />
                      <TextField size="small" placeholder="เขต/อำเภอ" sx={textFieldStyles} required value={newAddress.district} onChange={e => setNewAddress({...newAddress, district: e.target.value})} />
                    </Box>
                    
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                      <FormControl size="small" sx={textFieldStyles}>
                        <Select value={newAddress.province} onChange={e => setNewAddress({...newAddress, province: e.target.value as string})}>
                          <MenuItem value="กรุงเทพมหานคร">กรุงเทพมหานคร</MenuItem>
                          <MenuItem value="ลำพูน">ลำพูน</MenuItem>
                          <MenuItem value="ชัยภูมิ">ชัยภูมิ</MenuItem>
                          <MenuItem value="สกลนคร">สกลนคร</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField 
                        size="small" 
                        placeholder="รหัสไปรษณีย์ 5 หลัก" 
                        inputProps={{ maxLength: 5 }} 
                        error={!!postalError}
                        helperText={postalError}
                        sx={textFieldStyles} 
                        required 
                        value={newAddress.postalCode} 
                        onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} 
                      />
                    </Box>

                    <FormControlLabel control={<Checkbox sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#C5A55A" } }} />} label={<Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem" }}>ตั้งเป็นที่อยู่เริ่มต้น</Typography>} />
                    
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button variant="outlined" fullWidth onClick={() => setIsAddingNewAddress(false)} sx={{ borderRadius: "10px", borderColor: "#E5DFD6", color: "#6B7280", fontFamily: '"Kanit", sans-serif' }}>ยกเลิก</Button>
                      <Button variant="contained" fullWidth onClick={() => { /* Mock save */ setIsAddingNewAddress(false); }} sx={{ borderRadius: "10px", bgcolor: "#1B2A4A", fontFamily: '"Kanit", sans-serif' }}>บันทึก</Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* STEP 2: Shipping */}
          {currentStep === 1 && (
            <Box>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2, display: "flex", alignItems: "center" }}>
                <LocalShippingOutlinedIcon sx={{ mr: 1, fontSize: 22, color: "#C5A55A" }} /> วิธีการจัดส่ง
              </Typography>
              
              <RadioGroup value={selectedShippingId} onChange={(e) => setSelectedShippingId(e.target.value)}>
                {mockShippingOptions.map((ship) => (
                  <Box key={ship.id} sx={{ bgcolor: "#FFFFFF", borderRadius: "12px", p: 2, mb: 1.5, border: selectedShippingId === ship.id ? "2px solid #C5A55A" : "1px solid #E5DFD6" }}>
                    <FormControlLabel
                      value={ship.id}
                      control={<Radio sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#C5A55A" } }} />}
                      label={
                        <Box sx={{ ml: 1, display: "flex", flexdirection: "column", flex: 1, width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                          <Box>
                            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A" }}>
                              {ship.name}
                            </Typography>
                            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280", mt: 0.2 }}>
                              รับสินค้าประเมิน: {ship.estimatedDays}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: "#C5A55A" }}>
                            ฿{ship.cost}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "center", m: 0, width: "100%", '& .MuiFormControlLabel-label': { flex: 1 } }}
                    />
                  </Box>
                ))}
              </RadioGroup>
            </Box>
          )}

          {/* STEP 3: Payment */}
          {currentStep === 2 && (
            <Box>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2, display: "flex", alignItems: "center" }}>
                <PaymentOutlinedIcon sx={{ mr: 1, fontSize: 22, color: "#C5A55A" }} /> ช่องทางการชำระเงิน
              </Typography>

              <RadioGroup value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)}>
                
                {/* PromptPay */}
                <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "12px", p: 2, mb: 1.5, border: selectedPayment === "promptpay" ? "2px solid #C5A55A" : "1px solid #E5DFD6" }}>
                  <FormControlLabel
                    value="promptpay"
                    control={<Radio sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#C5A55A" } }} />}
                    label={<Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", ml: 1 }}>QR Code พร้อมเพย์</Typography>}
                    sx={{ m: 0 }}
                  />
                  {selectedPayment === "promptpay" && (
                    <Box sx={{ mt: 3, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "#FDF8F0", p: 3, borderRadius: "12px", border: "1px dashed #E5DFD6" }}>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#6B7280", mb: 2 }}>สแกนเพื่อชำระเงิน</Typography>
                      <Box sx={{ bgcolor: "#FFFFFF", p: 1.5, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", position: "relative" }}>
                        {qrPayload ? (
                          <QRCodeSVG
                            value={qrPayload}
                            size={180}
                            level="M"
                            style={{ opacity: timeLeft <= 0 ? 0.15 : 1, transition: "opacity 0.3s" }}
                          />
                        ) : (
                          <QrCode2RoundedIcon sx={{ fontSize: 150, color: "#E5DFD6" }} />
                        )}
                        {timeLeft <= 0 && (
                          <Button
                            onClick={() => setTimeLeft(900)}
                            startIcon={<ReplayRoundedIcon />}
                            sx={{ position: "absolute", inset: 0, m: "auto", width: "fit-content", height: "fit-content", bgcolor: "#1B2A4A", color: "#FFF", borderRadius: "10px", px: 2, fontFamily: '"Kanit", sans-serif', "&:hover": { bgcolor: "#0F1A30" } }}
                          >
                            สร้าง QR ใหม่
                          </Button>
                        )}
                      </Box>
                      <Box sx={{ mt: 2, textAlign: "center" }}>
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#1B2A4A", fontWeight: 600 }}>
                          พร้อมเพย์: {formatPromptPayIdDisplay(PROMPTPAY_ID)} · LAYA Platform
                        </Typography>
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", color: "#C5A55A", fontWeight: 700 }}>
                          ยอดชำระ ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 1.5, textAlign: "center" }}>
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>กรุณาชำระเงินภายใน</Typography>
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.5rem", color: "#D32F2F" }}>
                          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </Typography>
                      </Box>
                      {timeLeft <= 0 && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: "8px", fontFamily: '"Kanit", sans-serif' }}>
                          QR Code หมดอายุ กดสร้าง QR ใหม่เพื่อทำรายการต่อ
                        </Alert>
                      )}
                    </Box>
                  )}
                </Box>

                {/* Credit Card Mock */}
                <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "12px", p: 2, mb: 1.5, border: selectedPayment === "credit_card" ? "2px solid #C5A55A" : "1px solid #E5DFD6" }}>
                  <FormControlLabel
                    value="credit_card"
                    control={<Radio sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#C5A55A" } }} />}
                    label={<Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", ml: 1 }}>บัตรเครดิต / เดบิต</Typography>}
                    sx={{ m: 0 }}
                  />
                  {selectedPayment === "credit_card" && (
                    <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                      <TextField size="small" placeholder="หมายเลขบัตร 16 หลัก" sx={textFieldStyles} />
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField size="small" placeholder="MM/YY" sx={textFieldStyles} />
                        <TextField size="small" type="password" placeholder="CVV" sx={textFieldStyles} />
                      </Box>
                      <TextField size="small" placeholder="ชื่อบนบัตร" sx={textFieldStyles} />
                    </Box>
                  )}
                </Box>

              </RadioGroup>
            </Box>
          )}

          {/* STEP 4: Review */}
          {currentStep === 3 && (
            <Box>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2, display: "flex", alignItems: "center" }}>
                <ReceiptLongOutlinedIcon sx={{ mr: 1, fontSize: 22, color: "#C5A55A" }} /> ตรวจสอบคำสั่งซื้อ
              </Typography>

              {/* Items Summary limit visible items */}
              <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "12px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: "#1B2A4A", mb: 1.5 }}>
                  สินค้าที่สั่งซื้อ ({items.length})
                </Typography>
                {items.map(item => (
                  <Box key={item.id} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: "8px", overflow: "hidden", position: "relative" }}>
                      <Image src={item.product.images[0]} alt="" fill style={{ objectFit: "cover" }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", fontWeight: 600, color: "#1B2A4A" }}>{item.product.name}</Typography>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>จำนวน: {item.quantity}</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", fontWeight: 700, color: "#1B2A4A" }}>
                      ฿{(item.product.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Address Summary */}
              <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "12px", p: 2, mb: 2, border: "1px solid #E5DFD6", display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280", mb: 0.5 }}>จัดส่งไปที่</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", fontWeight: 600, color: "#1B2A4A" }}>
                    {mockAddresses.find(a => a.id === selectedAddressId)?.recipientName}
                  </Typography>
                </Box>
                <Button size="small" onClick={() => setCurrentStep(0)} sx={{ color: "#C5A55A", fontFamily: '"Kanit", sans-serif' }}>แก้ไข</Button>
              </Box>

              {/* Note String */}
              <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "12px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#1B2A4A", mb: 1, fontWeight: 600 }}>หมายเหตุถึงผู้ขาย (ถ้ามี)</Typography>
                <TextField
                  fullWidth multiline rows={2} placeholder="ระบุข้อความ..."
                  value={noteToSeller} onChange={e => setNoteToSeller(e.target.value)}
                  sx={textFieldStyles}
                />
              </Box>

              {/* Cost Summary */}
              <Box sx={{ bgcolor: "#FDF8F0", borderRadius: "12px", p: 2, mb: 2, border: "1px solid #EBE3D5" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>ยอดรวมสินค้า</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#1B2A4A", fontWeight: 600 }}>฿{subtotal.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>ค่าจัดส่ง</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#1B2A4A", fontWeight: 600 }}>฿{shippingCost.toLocaleString()}</Typography>
                </Box>
                <Divider sx={{ my: 1.5, borderColor: "rgba(0,0,0,0.06)" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.95rem", color: "#1B2A4A", fontWeight: 700 }}>ยอดรวมทั้งสิ้น</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.5rem", color: "#C5A55A", fontWeight: 700, lineHeight: 1 }}>฿{total.toLocaleString()}</Typography>
                </Box>
              </Box>

            </Box>
          )}

        </Box>

        {/* Sticky Bottom Actions */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 430,
            zIndex: 100,
            bgcolor: "#FFFFFF",
            p: 2,
            borderTop: "1px solid #E5DFD6",
            boxShadow: "0 -4px 12px rgba(27,42,74,0.05)",
          }}
        >
          <Button
            variant="contained"
            fullWidth
            disabled={(currentStep === 2 && selectedPayment === "promptpay" && timeLeft <= 0) || isProcessing}
            onClick={handleNextStep}
            sx={{
              py: 1.5,
              bgcolor: "#1B2A4A",
              color: "#FFFFFF",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "1rem",
              fontFamily: '"Kanit", sans-serif',
              "&:hover": { bgcolor: "#0F1A30" },
              "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.5)", color: "#FFFFFF" }
            }}
          >
            {currentStep === 3 ? "ยืนยันคำสั่งซื้อ" : "ถัดไป"}
          </Button>
        </Box>
      </Box>
    </MobileLayout>
  );
}
