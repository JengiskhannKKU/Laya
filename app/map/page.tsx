"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { ArrowLeft, X, Search, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────
// Data: 76 provinces + fabric metadata
// ─────────────────────────────────────────────
const REGIONS: Record<string, { color: string; label: string }> = {
  north:      { color: "#8B4513", label: "ภาคเหนือ" },
  northeast:  { color: "#B8860B", label: "ภาคตะวันออกเฉียงเหนือ" },
  central:    { color: "#1B5E20", label: "ภาคกลาง" },
  east:       { color: "#1565C0", label: "ภาคตะวันออก" },
  west:       { color: "#6A1B9A", label: "ภาคตะวันตก" },
  south:      { color: "#BF360C", label: "ภาคใต้" },
};

interface Province {
  id: string;
  name: string;
  fabric: string;
  region: keyof typeof REGIONS;
  colors: string[];
  geoName?: string; // English name matching GeoJSON
  image?: string; // Fabric pattern image path
}

const PROVINCES: Province[] = [
  // ── ภาคใต้ ──
  { id: "krabi",      name: "กระบี่",      fabric: "ผ้าลายลมหายใจจากฟ้าสู่กระบี่",region:"south",colors:["#1565C0","#42A5F5","#E3F2FD"], geoName: "Krabi", image: "/fabric_patterns/01.png" },
  { id: "kanchanaburi",name:"กาญจนบุรี",   fabric: "ผ้าลายตาจัก",              region: "central", colors: ["#37474F","#546E7A","#CFD8DC"], geoName: "Kanchanaburi", image: "/fabric_patterns/02.png" },
  { id: "kalasin",    name: "กาฬสินธุ์",   fabric: "ผ้าไหมแพรวาลายนาค ๑๒ แขน", region: "northeast", colors: ["#1A237E","#3949AB","#C5A55A"], geoName: "Kalasin", image: "/fabric_patterns/03.png" },
  { id: "kamphaengphet",name:"กำแพงเพชร",  fabric: "ผ้าลายศิลาล้อมเพชร",       region: "central", colors: ["#37474F","#455A64","#B0BEC5"], geoName: "Kamphaeng Phet", image: "/fabric_patterns/04.png" },
  { id: "khonkaen",   name: "ขอนแก่น",     fabric: "ผ้าลายแคนแก่นคูณ",          region: "northeast", colors: ["#B71C1C","#E53935","#FFCDD2"], geoName: "Khon Kaen", image: "/fabric_patterns/05.png" },
  { id: "chanthaburi",name:"จันทบุรี",     fabric: "ผ้าลายราชวัตรจันทบูร",     region: "east", colors: ["#BF360C","#E64A19","#FBE9E7"], geoName: "Chanthaburi", image: "/fabric_patterns/06.png" },
  { id: "chachoengsao",name:"ฉะเชิงเทรา",  fabric: "ผ้าลายสีด่อน",            region: "east", colors: ["#880E4F","#E91E63","#FCE4EC"], geoName: "Chachoengsao", image: "/fabric_patterns/07.png" },
  { id: "chonburi",   name: "ชลบุรี",      fabric: "ผ้าลายดอกประดู่",          region: "east", colors: ["#B71C1C","#E53935","#FFCDD2"], geoName: "Chon Buri", image: "/fabric_patterns/08.png" },
  { id: "chainat",    name: "ชัยนาท",      fabric: "ผ้าลายช่อใบมะขาม",         region: "central", colors: ["#1B5E20","#388E3C","#E8F5E9"], geoName: "Chai Nat", image: "/fabric_patterns/09.png" },
  { id: "chaiyaphum", name: "ชัยภูมิ",     fabric: "ผ้าลายหมี่คั่นขอนารี",      region: "northeast", colors: ["#4A148C","#7B1FA2","#F3E5F5"], geoName: "Chaiyaphum", image: "/fabric_patterns/10.png" },
  { id: "chumphon",   name: "ชุมพร",       fabric: "ผ้าลายดอกพุทธรักษา",      region: "south", colors: ["#F57F17","#FF8F00","#FFF8E1"], geoName: "Chumphon", image: "/fabric_patterns/11.png" },
  { id: "chiangrai",  name: "เชียงราย",   fabric: "ผ้าลายเชียงแสนหงส์ดำ",        region: "north", colors: ["#2C1810","#8B4513","#DAA520"], geoName: "Chiang Rai", image: "/fabric_patterns/12.png" },
  { id: "chiangmai",  name: "เชียงใหม่",   fabric: "ผ้าลายหงส์ในโคม",             region: "north", colors: ["#4A235A","#9B59B6","#F39C12"], geoName: "Chiang Mai", image: "/fabric_patterns/13.png" },
  { id: "trang",      name: "ตรัง",        fabric: "ผ้าลายแก้วชิงดาว",         region: "south", colors: ["#4A235A","#7B1FA2","#EDE7F6"], geoName: "Trang", image: "/fabric_patterns/14.png" },
  { id: "trat",       name: "ตราด",        fabric: "ผ้าลายศรีตราด",            region: "east", colors: ["#1565C0","#1976D2","#BBDEFB"], geoName: "Trat", image: "/fabric_patterns/15.png" },
  { id: "tak",        name: "ตาก",         fabric: "ผ้าลายดอกเสี้ยว",           region: "central", colors: ["#1B5E20","#2E7D32","#C8E6C9"], geoName: "Tak", image: "/fabric_patterns/16.png" },
  { id: "nakhonnayok",name:"นครนายก",      fabric: "ผ้าลายดอกสุพรรณิการ์",    region: "central", colors: ["#F57F17","#FFA000","#FFF8E1"], geoName: "Nakhon Nayok", image: "/fabric_patterns/17.png" },
  { id: "nakornpathom",name:"นครปฐม",      fabric: "ผ้าลายปูรณฆฏาศรีทวารวดี",  region: "central", colors: ["#4A235A","#6A1B9A","#EDE7F6"], geoName: "Nakhon Pathom", image: "/fabric_patterns/18.png" },
  { id: "nakorphanom",name: "นครพนม",      fabric: "ผ้ามุก",                    region: "northeast", colors: ["#880E4F","#E91E63","#FCE4EC"], geoName: "Nakhon Phanom", image: "/fabric_patterns/19.png" },
  { id: "nakorratchasima",name:"นครราชสีมา",fabric:"ผ้าหางกระรอกสีแสด",         region: "northeast", colors: ["#BF360C","#F4511E","#FBE9E7"], geoName: "Nakhon Ratchasima", image: "/fabric_patterns/20.png" },
  { id: "nakhonsithammarat",name:"นครศรีธรรมราช",fabric:"ผ้าลายดอกพิกุล",    region: "south", colors: ["#880E4F","#E91E63","#FCE4EC"], geoName: "Nakhon Si Thammarat", image: "/fabric_patterns/21.png" },
  { id: "nakornsawan",name: "นครสวรรค์",   fabric: "ผ้าลายพาสาน",              region: "central", colors: ["#880E4F","#C2185B","#FCE4EC"], geoName: "Nakhon Sawan", image: "/fabric_patterns/22.png" },
  { id: "nonthaburi", name: "นนทบุรี",     fabric: "ผ้าลายหม้อน้ำลายวิจิตร",   region: "central", colors: ["#1565C0","#1976D2","#E3F2FD"], geoName: "Nonthaburi", image: "/fabric_patterns/23.png" },
  { id: "narathiwat", name: "นราธิวาส",    fabric: "ผ้าลายพิกุลพลอย",          region: "south", colors: ["#4A235A","#6A1B9A","#EDE7F6"], geoName: "Narathiwat", image: "/fabric_patterns/24.png" },
  { id: "nan",        name: "น่าน",        fabric: "ผ้าลายน้ำไหล",               region: "north", colors: ["#1A5276","#2E86C1","#85C1E9"], geoName: "Nan", image: "/fabric_patterns/25.png" },
  { id: "buengkan",   name: "บึงกาฬ",      fabric: "ผ้าลายหมากเบ็ง",             region: "northeast", colors: ["#2E7D32","#66BB6A","#F1F8E9"], geoName: "Bueng Kan", image: "/fabric_patterns/26.png" },
  { id: "buriram",    name: "บุรีรัมย์",   fabric: "ผ้าหางกระรอกคู่",           region: "northeast", colors: ["#37474F","#607D8B","#ECEFF1"], geoName: "Buri Ram", image: "/fabric_patterns/27.png" },
  { id: "pathumthani",name: "ปทุมธานี",    fabric: "ผ้าลายรักบัว",             region: "central", colors: ["#AD1457","#E91E63","#FCE4EC"], geoName: "Pathum Thani", image: "/fabric_patterns/28.png" },
  { id: "prachuap",   name: "ประจวบคีรีขันธ์",fabric:"ผ้ายกดอกลายเต่า",       region: "west", colors: ["#006064","#0097A7","#E0F7FA"], geoName: "Prachuap Khiri Khan", image: "/fabric_patterns/29.png" },
  { id: "prachinburi",name:"ปราจีนบุรี",   fabric: "ผ้าลายปราจีนบุรี ศรีภูษา", region: "central", colors: ["#1A237E","#283593","#E8EAF6"], geoName: "Prachin Buri", image: "/fabric_patterns/30.png" },
  { id: "pattani",    name: "ปัตตานี",     fabric: "ผ้าลายจวนตานี",            region: "south", colors: ["#880E4F","#C2185B","#FCE4EC"], geoName: "Pattani", image: "/fabric_patterns/31.png" },
  { id: "ayutthaya",  name: "พระนครศรีอยุธยา",fabric:"ผ้าลายดอกโสน",          region: "central", colors: ["#B71C1C","#C62828","#FFCDD2"], geoName: "Phra Nakhon Si Ayutthaya", image: "/fabric_patterns/32.png" },
  { id: "phayao",     name: "พะเยา",       fabric: "ผ้าลายดอกสารภี",             region: "north", colors: ["#76448A","#AF7AC5","#F8C471"], geoName: "Phayao", image: "/fabric_patterns/33.png" },
  { id: "phangnga",   name: "พังงา",       fabric: "ผ้าลายจำปูนภูงา",          region: "south", colors: ["#006064","#00838F","#E0F7FA"], geoName: "Phangnga", image: "/fabric_patterns/34.png" },
  { id: "phatthalung",name:"พัทลุง",       fabric: "ผ้าลายดอกพะยอมเล็ก",      region: "south", colors: ["#1B5E20","#43A047","#E8F5E9"], geoName: "Phatthalung", image: "/fabric_patterns/35.png" },
  { id: "phichit",    name: "พิจิตร",      fabric: "ผ้าลายดอกบุนนาค",           region: "central", colors: ["#F57F17","#F9A825","#FFFDE7"], geoName: "Phichit", image: "/fabric_patterns/36.png" },
  { id: "phitsanulok", name:"พิษณุโลก",   fabric: "ผ้าลายดอกปีบ",              region: "central", colors: ["#1A237E","#283593","#E8EAF6"], geoName: "Phitsanulok", image: "/fabric_patterns/37.png" },
  { id: "phetchaburi",name:"เพชรบุรี",     fabric: "ผ้าลายสุวรรณวัชร์",       region: "west", colors: ["#4A235A","#7B1FA2","#EDE7F6"], geoName: "Phetchaburi", image: "/fabric_patterns/38.png" },
  { id: "phetchabun", name: "เพชรบูรณ์",   fabric: "ผ้าลายมัดหมี่คั่น",         region: "central", colors: ["#880E4F","#AD1457","#FCE4EC"], geoName: "Phetchabun", image: "/fabric_patterns/39.png" },
  { id: "phrae",      name: "แพร่",        fabric: "ผ้าลายดอกสัก",               region: "north", colors: ["#145A32","#27AE60","#FDEBD0"], geoName: "Phrae", image: "/fabric_patterns/40.png" },
  { id: "phuket",     name: "ภูเก็ต",      fabric: "ผ้าลายปะการังและท้องทะเล", region: "south", colors: ["#0277BD","#0288D1","#E1F5FE"], geoName: "Phuket", image: "/fabric_patterns/41.png" },
  { id: "mahasarakham",name:"มหาสารคาม",   fabric: "ผ้าลายสร้อยดอกหมาก",        region: "northeast", colors: ["#E65100","#FB8C00","#FFF3E0"], geoName: "Maha Sarakham", image: "/fabric_patterns/42.png" },
  { id: "mukdahan",   name: "มุกดาหาร",    fabric: "ผ้าลายแก้วมุกดา",            region: "northeast", colors: ["#006064","#00ACC1","#E0F7FA"], geoName: "Mukdahan", image: "/fabric_patterns/43.png" },
  { id: "maehongson", name: "แม่ฮ่องสอน",  fabric: "ผ้าลายเอื้องแซะ",            region: "north", colors: ["#922B21","#E74C3C","#F9E79F"], geoName: "Mae Hong Son", image: "/fabric_patterns/44.png" },
  { id: "yasothon",   name: "ยโสธร",       fabric: "ผ้าลายยศสุนทร",             region: "northeast", colors: ["#1B5E20","#43A047","#E8F5E9"], geoName: "Yasothon", image: "/fabric_patterns/45.png" },
  { id: "yala",       name: "ยะลา",        fabric: "ผ้าลายยะลารวมใจ",          region: "south", colors: ["#1A237E","#283593","#F8BBD9"], geoName: "Yala", image: "/fabric_patterns/46.png" },
  { id: "roiet",      name: "ร้อยเอ็ด",    fabric: "ผ้าไหมลายสาเกต",            region: "northeast", colors: ["#880E4F","#C2185B","#FCE4EC"], geoName: "Roi Et", image: "/fabric_patterns/47.png" },
  { id: "ranong",     name: "ระนอง",       fabric: "ผ้าลายอินทนิล สินธุ์แร่นอง",region: "south", colors: ["#1A237E","#283593","#E8EAF6"], geoName: "Ranong", image: "/fabric_patterns/48.png" },
  { id: "rayong",     name: "ระยอง",       fabric: "ผ้าลายตากะหมุก",           region: "east", colors: ["#006064","#00796B","#E0F2F1"], geoName: "Rayong", image: "/fabric_patterns/49.png" },
  { id: "ratchaburi", name: "ราชบุรี",     fabric: "ผ้าลายราชาบุรี",           region: "central", colors: ["#880E4F","#AD1457","#F8BBD9"], geoName: "Ratchaburi", image: "/fabric_patterns/50.png" },
  { id: "lopburi",    name: "ลพบุรี",      fabric: "ผ้าลายดอกพิกุล",           region: "central", colors: ["#880E4F","#E91E63","#FCE4EC"], geoName: "Lop Buri", image: "/fabric_patterns/51.png" },
  { id: "lampang",    name: "ลำปาง",       fabric: "ผ้าลายม้าขาว",               region: "north", colors: ["#784212","#D35400","#FBEEE6"], geoName: "Lampang", image: "/fabric_patterns/52.png" },
  { id: "lamphun",    name: "ลำพูน",       fabric: "ผ้าลายดอกลำดวน",             region: "north", colors: ["#6C3483","#A569BD","#FDEDEC"], geoName: "Lamphun", image: "/fabric_patterns/53.png" },
  { id: "loei",       name: "เลย",         fabric: "ผ้าลายดอกฝ้ายเมืองเลย",      region: "northeast", colors: ["#1A5276","#5DADE2","#FDFEFE"], geoName: "Loei", image: "/fabric_patterns/54.png" },
  { id: "sisaket",    name: "ศรีสะเกษ",    fabric: "ผ้าเหยียบลายลูกแก้ว",       region: "northeast", colors: ["#006064","#0097A7","#E0F7FA"], geoName: "Si Sa Ket", image: "/fabric_patterns/55.png" },
  { id: "sakon",      name: "สกลนคร",      fabric: "ผ้าลายนครธรรม",             region: "northeast", colors: ["#4A235A","#8E24AA","#F3E5F5"], geoName: "Sakon Nakhon", image: "/fabric_patterns/56.png" },
  { id: "songkhla",   name: "สงขลา",       fabric: "ผ้าลายราชวัตร",            region: "south", colors: ["#BF360C","#E64A19","#FBE9E7"], geoName: "Songkhla", image: "/fabric_patterns/57.png" },
  { id: "satun",      name: "สตูล",        fabric: "ผ้าลายดาวน์บูดิงฟอสซิลสตูล",region:"south",colors:["#006064","#00BCD4","#E0F7FA"], geoName: "Satun", image: "/fabric_patterns/58.png" },
  { id: "samutprakan", name:"สมุทรปราการ",  fabric: "ผ้าลายดอกดาวเรือง",       region: "central", colors: ["#F57F17","#F9A825","#FFF9C4"], geoName: "Samut Prakan", image: "/fabric_patterns/59.png" },
  { id: "samutsongkhram",name:"สมุทรสงคราม",fabric:"ผ้าลายสมุทราสุมามาลย์",   region: "central", colors: ["#1565C0","#1E88E5","#E3F2FD"], geoName: "Samut Songkhram", image: "/fabric_patterns/60.png" },
  { id: "samutsakorn", name:"สมุทรสาคร",   fabric: "ผ้าลายลวดลายปลาทู",        region: "central", colors: ["#006064","#00838F","#E0F7FA"], geoName: "Samut Sakhon", image: "/fabric_patterns/61.png" },
  { id: "sakaew",     name: "สระแก้ว",     fabric: "ผ้าลายสระแก้ว",            region: "east", colors: ["#1B5E20","#388E3C","#C8E6C9"], geoName: "Sa Kaeo", image: "/fabric_patterns/62.png" },
  { id: "saraburi",   name: "สระบุรี",     fabric: "ผ้าลายก้ามปู",             region: "central", colors: ["#006064","#0097A7","#E0F7FA"], geoName: "Saraburi", image: "/fabric_patterns/63.png" },
  { id: "singburi",   name: "สิงห์บุรี",   fabric: "ผ้าลายริ้วทอง",            region: "central", colors: ["#F57F17","#FBC02D","#FFF9C4"], geoName: "Sing Buri", image: "/fabric_patterns/64.png" },
  { id: "sukhothai",  name: "สุโขทัย",     fabric: "ผ้าลายจก ๙ ลาย",            region: "central", colors: ["#4E342E","#795548","#EFEBE9"], geoName: "Sukhothai", image: "/fabric_patterns/65.png" },
  { id: "suphanburi", name: "สุพรรณบุรี",  fabric: "ผ้าลายดอกมะเกลือ",        region: "central", colors: ["#1B5E20","#2E7D32","#C8E6C9"], geoName: "Suphan Buri", image: "/fabric_patterns/66.png" },
  { id: "suratthani", name: "สุราษฎร์ธานี",fabric: "ผ้าลายราชวัตรโคม",        region: "south", colors: ["#880E4F","#AD1457","#FCE4EC"], geoName: "Surat Thani", image: "/fabric_patterns/67.png" },
  { id: "surin",      name: "สุรินทร์",    fabric: "ผ้าลายโฮล",                 region: "northeast", colors: ["#B71C1C","#E53935","#FFF9C4"], geoName: "Surin", image: "/fabric_patterns/68.png" },
  { id: "nongkhai",   name: "หนองคาย",     fabric: "ผ้าลายนาคใหญ่",             region: "northeast", colors: ["#1B2A4A","#2E86C1","#C5A55A"], geoName: "Nong Khai", image: "/fabric_patterns/69.png" },
  { id: "nongbua",    name: "หนองบัวลำภู", fabric: "ผ้าลายขิดสลับหมี่",          region: "northeast", colors: ["#E91E63","#F48FB1","#FCE4EC"], geoName: "Nong Bua Lam Phu", image: "/fabric_patterns/70.png" },
  { id: "angthong",   name: "อ่างทอง",     fabric: "ผ้าลายรวงทอง",             region: "central", colors: ["#F9A825","#FDD835","#FFFDE7"], geoName: "Ang Thong", image: "/fabric_patterns/71.png" },
  { id: "amnatcharoen",name:"อำนาจเจริญ",  fabric: "ผ้าลายดอกแก้ว",             region: "northeast", colors: ["#4E342E","#8D6E63","#EFEBE9"], geoName: "Amnat Charoen", image: "/fabric_patterns/72.png" },
  { id: "udonthani",  name: "อุดรธานี",    fabric: "ผ้าลายก้นหอย",              region: "northeast", colors: ["#BF360C","#FF7043","#FBE9E7"], geoName: "Udon Thani", image: "/fabric_patterns/73.png" },
  { id: "uttaradit",  name: "อุตรดิตถ์",   fabric: "ผ้าลายดอกประดู่ศรีอุตรดิตถ์", region: "north", colors: ["#922B21","#CB4335","#F5CBA7"], geoName: "Uttaradit", image: "/fabric_patterns/74.png" },
  { id: "uthaithani", name: "อุทัยธานี",   fabric: "ผ้าลายอุทัยสุพรรณิการ์",   region: "central", colors: ["#F57F17","#FF8F00","#FFF8E1"], geoName: "Uthai Thani", image: "/fabric_patterns/75.png" },
  { id: "ubonratchathani",name:"อุบลราชธานี",fabric:"ผ้าลายกาบบัว",            region: "northeast", colors: ["#880E4F","#AD1457","#FCE4EC"], geoName: "Ubon Ratchathani", image: "/fabric_patterns/76.png" },
  { id: "bangkok",    name: "กรุงเทพมหานคร",fabric:"ผ้าลายกรุงรัตนโกสินทร์",  region: "central", colors: ["#FFD700","#800080","#191970"], geoName: "Bangkok Metropolis" },
];

// Build lookup: GeoJSON English name → Province
const GEO_NAME_MAP: Record<string, Province> = {};
PROVINCES.forEach((p) => { if (p.geoName) GEO_NAME_MAP[p.geoName] = p; });

// ─────────────────────────────────────────────
// Simple Mercator projection (zero dependency)
// ─────────────────────────────────────────────
function mercatorProject(
  lon: number, lat: number,
  cx: number, cy: number, scale: number
): [number, number] {
  const x = (lon - cx) * scale;
  const y = -(Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2)) -
    Math.log(Math.tan(Math.PI / 4 + (cy * Math.PI / 180) / 2))) * (scale * 180 / Math.PI);
  return [x, y];
}

function coordsToPath(coords: number[][][], cx: number, cy: number, scale: number): string {
  return coords.map(ring => {
    const pts = ring.map(([lon, lat]) => mercatorProject(lon, lat, cx, cy, scale));
    return "M" + pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L") + "Z";
  }).join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function featureToPath(geometry: any, cx: number, cy: number, scale: number): string {
  if (geometry.type === "Polygon") {
    return coordsToPath(geometry.coordinates, cx, cy, scale);
  } else if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((poly: number[][][]) => coordsToPath(poly, cx, cy, scale)).join("");
  }
  return "";
}

// ─────────────────────────────────────────────
// Fabric Swatch - using actual fabric pattern image
// ─────────────────────────────────────────────
function FabricSwatch({ colors, image, size = 48 }: { colors: string[]; image?: string; size?: number }) {
  if (image) {
    return (
      <div
        className="rounded-lg overflow-hidden"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }
  // Fallback to generated pattern if no image
  const [c1, c2, c3] = colors;
  const id = `p${c1.replace("#","")}_${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={id} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill={c1} />
          <rect x="0" y="0" width="6" height="6" fill={c2} opacity="0.7" />
          <rect x="6" y="6" width="6" height="6" fill={c2} opacity="0.7" />
          <line x1="0" y1="0" x2="12" y2="12" stroke={c3} strokeWidth="0.8" opacity="0.5" />
          <line x1="12" y1="0" x2="0" y2="12" stroke={c3} strokeWidth="0.8" opacity="0.5" />
          <circle cx="6" cy="6" r="1.5" fill={c3} opacity="0.8" />
        </pattern>
      </defs>
      <rect width="48" height="48" rx="8" fill={`url(#${id})`} />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Province Detail Bottom Sheet
// ─────────────────────────────────────────────
function ProvinceSheet({ province, onClose }: { province: Province; onClose: () => void }) {
  const region = REGIONS[province.region];
  const [c1, c2, c3] = province.colors;
  const patId = `detail_${province.id}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
      style={{ background: "rgba(27,42,74,0.5)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="w-full rounded-t-3xl p-6 pb-10 animate-[slideUp_0.3s_ease]"
        style={{ background: "#FAF6F0", maxHeight: "70vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#E5DFD6" }} />

        {/* Fabric preview banner - using actual image */}
        <div className="w-full h-28 rounded-2xl mb-5 overflow-hidden"
          style={{
            backgroundImage: province.image ? `url(${province.image})` : `linear-gradient(135deg, ${c1}, ${c2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
        </div>

        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1B2A4A", fontFamily: "var(--font-playfair)" }}>
              {province.name}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: region.color + "20", color: region.color }}>
              {region.label}
            </span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#F0EBE3" }}>
            <X size={16} color="#1B2A4A" />
          </button>
        </div>

        <div className="mt-4 p-4 rounded-2xl" style={{ background: "#F0EBE3" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#6B7280" }}>ลายผ้าเอกลักษณ์ประจำจังหวัด</p>
          <p className="text-base font-bold" style={{ color: "#1B2A4A" }}>{province.fabric}</p>
        </div>

        <div className="flex gap-2 mt-4 items-center">
          <span className="text-xs" style={{ color: "#9CA3AF" }}>สีประจำลาย</span>
          {province.colors.map((c) => (
            <div key={c} className="w-6 h-6 rounded-full border-2" style={{ background: c, borderColor: "#fff" }} />
          ))}
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Province Card (list view)
// ─────────────────────────────────────────────
function ProvinceCard({ province, onClick }: { province: Province; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 border-b active:bg-[#F0EBE3] transition-colors text-left"
      style={{ borderColor: "#F0EBE3" }}>
      <div className="flex-shrink-0"><FabricSwatch colors={province.colors} image={province.image} size={48} /></div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: "#1B2A4A" }}>{province.name}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: "#6B7280" }}>{province.fabric}</p>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block"
          style={{ background: REGIONS[province.region].color + "18", color: REGIONS[province.region].color }}>
          {REGIONS[province.region].label}
        </span>
      </div>
      <ChevronRight size={16} color="#C5A55A" />
    </button>
  );
}

// ─────────────────────────────────────────────
// Region Filter Chips
// ─────────────────────────────────────────────
function RegionFilter({ selected, onChange }: { selected: string; onChange: (r: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button onClick={() => onChange("all")}
        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
        style={{ background: selected === "all" ? "#1B2A4A" : "#F0EBE3", color: selected === "all" ? "#C5A55A" : "#6B7280" }}>
        ทั้งหมด 76 จ.
      </button>
      {Object.entries(REGIONS).map(([key, val]) => (
        <button key={key} onClick={() => onChange(key)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap"
          style={{ background: selected === key ? val.color : "#F0EBE3", color: selected === key ? "#fff" : "#6B7280" }}>
          {val.label.replace("ภาคตะวันออกเฉียงเหนือ", "อีสาน").replace("ภาค", "")}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Interactive GeoJSON Thailand Map
// ─────────────────────────────────────────────
const GEOJSON_URL = "https://raw.githubusercontent.com/apisit/thailand.json/master/thailandWithName.json";

interface GeoFeature {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geometry: any;
  properties: { name: string };
}

function ThailandGeoMap({
  regionFilter,
  onSelect,
}: {
  regionFilter: string;
  onSelect: (p: Province) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoData, setGeoData] = useState<any>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Zoom & pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then(d => { setGeoData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cx = 101.5, cy = 13.2, scale = 56;
  const baseW = 520, baseH = 700;

  // viewBox changes with zoom & pan
  const viewBox = useMemo(() => {
    const w = baseW / zoom;
    const h = baseH / zoom;
    const x = -w / 2 + pan.x;
    const y = -h / 2 + pan.y;
    return `${x} ${y} ${w} ${h}`;
  }, [zoom, pan]);

  const { paths, patterns } = useMemo(() => {
    if (!geoData) return { paths: [], patterns: [] };

    const pats: React.ReactNode[] = [];
    const ps: { geoName: string; d: string; province: Province | null }[] = [];

    geoData.features.forEach((f: GeoFeature) => {
      const geoName = f.properties.name;
      const province = GEO_NAME_MAP[geoName] || null;

      // Filter by region
      if (regionFilter !== "all" && (!province || province.region !== regionFilter)) return;

      const d = featureToPath(f.geometry, cx, cy, scale);
      if (!d) return;

      const patId = `geo_${geoName.replace(/\s+/g, "_")}`;
      const [c1, c2, c3] = province
        ? province.colors
        : ["#C0B090", "#A89878", "#E8DCC8"];

      // Use image pattern if available, otherwise fallback to color pattern
      if (province?.image) {
        pats.push(
          <pattern key={patId} id={patId} patternUnits="userSpaceOnUse" width="100" height="100">
            <image href={province.image} width="100" height="100" preserveAspectRatio="xMidYMid slice" />
          </pattern>
        );
      } else {
        pats.push(
          <pattern key={patId} id={patId} patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill={c1} />
            <rect x="0" y="0" width="4" height="4" fill={c2} opacity="0.55" />
            <rect x="4" y="4" width="4" height="4" fill={c2} opacity="0.55" />
            <line x1="0" y1="0" x2="8" y2="8" stroke={c3} strokeWidth="0.8" opacity="0.45" />
            <line x1="8" y1="0" x2="0" y2="8" stroke={c3} strokeWidth="0.6" opacity="0.3" />
          </pattern>
        );
      }

      ps.push({ geoName, d, province });
    });

    return { paths: ps, patterns: pats };
  }, [geoData, regionFilter]);

  const handleClick = useCallback((province: Province | null) => {
    if (province) onSelect(province);
  }, [onSelect]);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.4, 5));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.4, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Drag handlers for panning
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ ...pan });
    (e.target as SVGSVGElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    // Convert pixel delta to viewBox delta
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const vbW = baseW / zoom;
    const vbH = baseH / zoom;
    const dx = ((e.clientX - dragStart.x) / rect.width) * vbW;
    const dy = ((e.clientY - dragStart.y) / rect.height) * vbH;
    setPan({ x: panStart.x - dx, y: panStart.y - dy });
  };

  const handlePointerUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z * 1.15, 5));
    } else {
      setZoom(z => Math.max(z / 1.15, 0.5));
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-4 rounded-full animate-spin"
            style={{ borderColor: "#E5DFD6", borderTopColor: "#8B4513" }} />
          <p className="text-xs" style={{ color: "#9CA3AF" }}>กำลังโหลดแผนที่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ background: "#F0EBE3", borderRadius: 16, overflow: "hidden" }}>
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold active:scale-90 transition-transform"
          style={{ background: "rgba(27,42,74,0.88)", color: "#C5A55A", backdropFilter: "blur(6px)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          +
        </button>
        <button onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold active:scale-90 transition-transform"
          style={{ background: "rgba(27,42,74,0.88)", color: "#C5A55A", backdropFilter: "blur(6px)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          −
        </button>
        {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
          <button onClick={handleReset}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold active:scale-90 transition-transform"
            style={{ background: "rgba(27,42,74,0.88)", color: "#FFD700", backdropFilter: "blur(6px)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            ↺
          </button>
        )}
      </div>

      {/* Zoom level indicator */}
      {zoom !== 1 && (
        <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-lg text-[10px] font-semibold"
          style={{ background: "rgba(27,42,74,0.8)", color: "#C5A55A" }}>
          {Math.round(zoom * 100)}%
        </div>
      )}

      <svg
        viewBox={viewBox}
        className="w-full"
        style={{ display: "block", cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <defs>{patterns}</defs>
        {paths.map(({ geoName, d, province }) => {
          const isHovered = hovered === geoName;
          const patId = `geo_${geoName.replace(/\s+/g, "_")}`;
          return (
            <path
              key={geoName}
              d={d}
              fill={`url(#${patId})`}
              stroke={isHovered ? "#FFD700" : "#FFFFFF"}
              strokeWidth={isHovered ? 1.8 : 0.5}
              style={{
                cursor: province ? "pointer" : "default",
                transition: "stroke-width 0.15s, opacity 0.15s",
                opacity: hovered && !isHovered ? 0.65 : 1,
                filter: isHovered ? "brightness(1.15)" : "none",
              }}
              onMouseEnter={() => setHovered(geoName)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(province)}
            />
          );
        })}
      </svg>

      {/* Hover label */}
      {hovered && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-xl text-center pointer-events-none"
          style={{ background: "rgba(27,42,74,0.92)", backdropFilter: "blur(6px)", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
          <p className="text-xs font-bold" style={{ color: "#FFD700" }}>
            {GEO_NAME_MAP[hovered]?.name || hovered}
          </p>
          {GEO_NAME_MAP[hovered] && (
            <p className="text-[10px]" style={{ color: "#C5A55A" }}>
              {GEO_NAME_MAP[hovered].fabric}
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="p-3 flex flex-wrap gap-2 justify-center border-t" style={{ borderColor: "#E5DFD6" }}>
        {Object.entries(REGIONS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: val.color }} />
            <span className="text-[10px]" style={{ color: "#6B7280" }}>{val.label.replace("ภาค","")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function MapPage() {
  const router = useRouter();
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [regionFilter, setRegionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"map" | "list">("map");

  const filtered = PROVINCES.filter((p) => {
    const matchRegion = regionFilter === "all" || p.region === regionFilter;
    const matchSearch = searchQuery === "" || p.name.includes(searchQuery) || p.fabric.includes(searchQuery);
    return matchRegion && matchSearch;
  });

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#F0EBE3" }}>
          <ArrowLeft size={18} color="#1B2A4A" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: "#1B2A4A", fontFamily: "var(--font-playfair)" }}>
            แผนที่ผ้าไทย
          </h1>
          <p className="text-xs" style={{ color: "#6B7280" }}>
            ๗๖ จังหวัด ร้อยดวงใจ สืบสานผ้าเอกลักษณ์ไทย
          </p>
        </div>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "#E5DFD6" }}>
          {(["map","list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ background: view === v ? "#1B2A4A" : "#FAF6F0", color: view === v ? "#C5A55A" : "#6B7280" }}>
              {v === "map" ? "แผนที่" : "รายการ"}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#F0EBE3" }}>
          <Search size={16} color="#9CA3AF" />
          <input type="text" placeholder="ค้นหาจังหวัด หรือชื่อลายผ้า..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: "#1B2A4A" }} />
          {searchQuery && <button onClick={() => setSearchQuery("")}><X size={14} color="#9CA3AF" /></button>}
        </div>
      </div>

      {/* Region filter */}
      <div className="px-4 mb-4">
        <RegionFilter selected={regionFilter} onChange={setRegionFilter} />
      </div>

      {/* Map View */}
      {view === "map" && (
        <div className="px-4 mb-4">
          <ThailandGeoMap regionFilter={regionFilter} onSelect={setSelectedProvince} />
          <p className="text-xs text-center mt-2" style={{ color: "#9CA3AF" }}>
            แตะจังหวัดบนแผนที่เพื่อดูลายผ้า
          </p>
        </div>
      )}

      {/* Province list */}
      <div className={view === "map" ? "mt-2" : ""}>
        {view === "list" && (
          <p className="px-4 py-2 text-xs font-semibold" style={{ color: "#6B7280" }}>{filtered.length} จังหวัด</p>
        )}
        {(view === "list" ? filtered : []).map((p) => (
          <ProvinceCard key={p.id} province={p} onClick={() => setSelectedProvince(p)} />
        ))}
        {view === "list" && filtered.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm" style={{ color: "#9CA3AF" }}>ไม่พบจังหวัดที่ค้นหา</p>
          </div>
        )}
      </div>

      <div style={{ height: 100 }} />

      {/* Bottom Sheet */}
      {selectedProvince && <ProvinceSheet province={selectedProvince} onClose={() => setSelectedProvince(null)} />}

      <style>{`
        @keyframes slideUp { from { transform:translateY(100%);opacity:0 } to { transform:translateY(0);opacity:1 } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </MobileLayout>
  );
}
