/**
 * ตัวช่วยสำหรับเทส API — สตาร์ท backend จริงบนพอร์ตทดสอบ, sign token, เรียก API, ต่อ DB
 * เทสรันกับ DATABASE_URL ใน .env (ฐานเดียวกับ dev) — ข้อมูลทดสอบใช้อีเมล *@laya.local และลบทิ้งท้ายเทสเสมอ
 */
require("dotenv").config();
const { spawn } = require("child_process");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const TEST_PORT = Number(process.env.TEST_PORT || 4995);
const API = `http://localhost:${TEST_PORT}`;

function createPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

/** สตาร์ทเซิร์ฟเวอร์ backend (tsx) แล้วรอจน /health ตอบ — คืนฟังก์ชัน stop() */
async function startServer() {
  const child = spawn("npx", ["tsx", "src/server.ts"], {
    cwd: __dirname + "/..",
    env: { ...process.env, PORT: String(TEST_PORT), NODE_ENV: "test" },
    shell: true,
    stdio: "ignore",
    detached: false,
  });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${API}/health`);
      if (res.ok) return () => new Promise((resolve) => {
        // บน Windows ต้อง kill ทั้ง tree (npx → tsx → node)
        const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { shell: true, stdio: "ignore" });
        killer.on("exit", resolve);
        killer.on("error", resolve);
      });
    } catch { /* ยังไม่ขึ้น — รอต่อ */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`backend ไม่ขึ้นภายใน 30 วิ (port ${TEST_PORT})`);
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

/** เรียก API — คืน { status, data } เสมอ (ไม่ throw ตาม status เพื่อให้เทส assert เองได้) */
async function api(path, opts = {}, token) {
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

module.exports = { API, TEST_PORT, createPool, startServer, signToken, api };
