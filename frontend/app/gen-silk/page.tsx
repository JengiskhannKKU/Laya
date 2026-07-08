"use client";

import { useState, useRef } from "react";
import { useAppModal } from "@/components/providers/AppModalProvider";
// Assumes this component exists: change div if missing
import Image from "next/image";
import { useRouter } from "next/navigation";

// ──────────────────────────────────────────────
// SVG Icons
// ──────────────────────────────────────────────
const ArrowLeftIcon = ({ size = 18, color = "#1B2A4A" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const SparklesIcon = ({ size = 12, color = "#C5A55A" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const UploadIcon = ({ size = 20, color = "#C5A55A" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const XIcon = ({ size = 12, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const Wand2Icon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
    <path d="m14 7 3 3" />
    <path d="M5 6v4" />
    <path d="M19 14v4" />
    <path d="M10 2v2" />
    <path d="M7 8H3" />
    <path d="M21 16h-4" />
    <path d="M11 3H9" />
  </svg>
);

const MudmeeIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z"/>
    <path d="M4 8h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16"/>
  </svg>
);

const SilkIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 16 4 4 4-4M3 8l4-4 4 4M21 16l-4 4-4-4M21 8l-4-4-4 4"/>
  </svg>
);

const CottonIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const BatikIcon = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 3v3M12 18v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M3 12h3M18 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1"/>
  </svg>
);

// ──────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────
const PATTERN_STYLES = [
  { id: "mudmee", label: "มัดหมี่", labelEn: "Mudmee", color: "#1B2A4A", Icon: MudmeeIcon },
  { id: "silk", label: "ผ้าไหม", labelEn: "Thai Silk", color: "#8B1A4A", Icon: SilkIcon },
  { id: "cotton", label: "ผ้าฝ้าย", labelEn: "Thai Cotton", color: "#5A7A3A", Icon: CottonIcon },
  { id: "batik", label: "บาติก", labelEn: "Batik", color: "#C5760A", Icon: BatikIcon },
];

const PROMPT_SUGGESTIONS = [
  "ลายดอกบัวพันกัน สีทองบนพื้นกรมท่า",
  "ลายนกยูงกางปีก สีม่วงอมน้ำเงิน",
  "ลายช้างคู่ สลับลายหน้ากระดาน",
];

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export default function GenSilkPage() {
  const router = useRouter();
  const { showAlert } = useAppModal();

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("mudmee");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !imageFile) {
        showAlert({ title: "ยังไม่มีข้อมูลสำหรับสร้างลาย", message: "กรุณากรอก Prompt หรือแนบรูปภาพลายตัวอย่าง", tone: "warning" });
        return;
    }
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("style", style);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      // NOTE: Update port if your pixel-backend runs on a different port.
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/generate";
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResult({
            prompt: data.promptUsed || prompt,
            imageUrl: data.imageUrl,
            message: data.message
        });
      } else {
        showAlert({ title: "สร้างลายไม่สำเร็จ", message: data.error || "กรุณาลองใหม่อีกครั้ง", tone: "warning" });
      }
    } catch (error) {
      console.error(error);
      showAlert({ title: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", message: "ตรวจสอบว่าเปิด Backend API แล้วหรือไม่", tone: "warning" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-white shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 transition-colors active:bg-gray-200"
        >
          <ArrowLeftIcon size={18} color="#1B2A4A" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight text-[#1B2A4A]">เจนภาพลายผ้าไทย</h1>
          <p className="text-xs text-gray-500">AI สร้างสรรค์ลายผ้าด้วย Prompt หรือรูปภาพ</p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1B2A4A] text-[#C5A55A]">
          <SparklesIcon size={12} />
          AI
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        
        {/* Style Selection */}
        <div>
            <label className="block text-sm font-semibold mb-2 text-[#1B2A4A]">เลือกประเภทผ้า</label>
            <div className="grid grid-cols-2 gap-2">
                {PATTERN_STYLES.map(s => (
                    <button 
                        key={s.id} 
                        onClick={() => setStyle(s.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${style === s.id ? 'border-[#C5A55A] bg-yellow-50 text-[#1B2A4A] ring-1 ring-[#C5A55A]' : 'border-gray-200 bg-white text-gray-600'}`}
                    >
                        <s.Icon size={16} color={style === s.id ? '#C5A55A' : 'currentColor'} />
                        {s.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Prompt Input */}
        <div>
            <label className="block text-sm font-semibold mb-2 text-[#1B2A4A]">รายละเอียดลาย (Prompt)</label>
            <textarea 
                rows={3}
                placeholder="เช่น ลายดอกบัวพันกัน สีทองบนพื้นกรมท่า..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#C5A55A] focus:border-transparent outline-none transition-shadow"
            />
            <div className="flex flex-wrap gap-2 mt-2">
                {PROMPT_SUGGESTIONS.map((sug, i) => (
                    <button 
                        key={i} 
                        onClick={() => setPrompt(sug)}
                        className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-full text-gray-500 active:bg-gray-50"
                    >
                        + {sug}
                    </button>
                ))}
            </div>
        </div>

        {/* Image Upload */}
        <div>
            <label className="block text-sm font-semibold mb-2 text-[#1B2A4A]">แนบรูปตัวอย่าง (Optional)</label>
            {!imagePreview ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white active:bg-gray-50 transition-colors cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center mb-2">
                        <UploadIcon size={20} color="#C5A55A" />
                    </div>
                    <span className="text-sm font-medium text-[#1B2A4A]">อัปโหลดรูปภาพลายผ้า</span>
                    <span className="text-xs text-gray-400 mt-1">ไฟล์ JPG, PNG</span>
                </div>
            ) : (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
                    >
                        <XIcon size={12} color="white" />
                    </button>
                </div>
            )}
            <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
            />
        </div>

        {/* Generate Button */}
        <button 
            disabled={loading}
            onClick={handleGenerate}
            className="w-full bg-[#1B2A4A] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70"
        >
            {loading ? (
                <span className="animate-pulse">กำลังประมวลผล AI...</span>
            ) : (
                <>
                    <Wand2Icon size={18} />
                    สร้างลายผ้าด้วย AI
                </>
            )}
        </button>

        {/* Result Area */}
        {result && (
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon size={16} color="#C5A55A" />
                    <h3 className="font-bold text-[#1B2A4A]">ผลลัพธ์ที่สร้างได้</h3>
                </div>
                {result.imageUrl ? (
                    <div className="rounded-xl overflow-hidden mb-3 aspect-square relative bg-gray-100">
                        <img src={result.imageUrl} alt="Generated Silk Pattern" className="w-full h-full object-cover" />
                    </div>
                ) : null}
                <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="font-semibold text-[#1B2A4A]">Prompt:</span> {result.prompt}
                    <br />
                    <span className="text-emerald-600 mt-1 block">{result.message}</span>
                </p>
            </div>
        )}

      </div>
    </div>
  );
}