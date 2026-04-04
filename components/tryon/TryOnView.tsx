"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


// ── MediaPipe Pose landmark indices ──────────────────────────────────────────
const LANDMARKS = {
  RIGHT_SHOULDER: 12,
  LEFT_SHOULDER: 11,
  RIGHT_WRIST: 16,
  LEFT_WRIST: 15,
  RIGHT_HIP: 24,
  LEFT_HIP: 23,
} as const;
type LandmarkMode = keyof typeof LANDMARKS | "BODY";

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// ─────────────────────────────────────────────────────────────────────────────

interface TryOnViewProps {
  /** Optional path to a .glb model in /public, e.g. "/models/bag.glb" */
  modelUrl?: string;
  /** Optional display name shown in the header */
  modelName?: string;
  /** Default landmark to attach the model to */
  defaultMode?: LandmarkMode;
}

export default function TryOnView({
  modelUrl,
  modelName,
  defaultMode = "RIGHT_SHOULDER",
}: TryOnViewProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Three.js refs (stable, never re-created)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraThreeRef = useRef<THREE.PerspectiveCamera | null>(null);
  // meshRef holds either the box Mesh or the loaded GLTF Group
  const meshRef = useRef<THREE.Object3D | null>(null);


  // MediaPipe / stream refs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const poseRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mpCameraRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const landmarksRef = useRef<PoseLandmark[] | null>(null);
  // Guards against pose.send() being called after pose.close() (BindingError)
  const activeRef = useRef(false);


  const [status, setStatus] = useState<"idle" | "loading" | "running" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const modeRef = useRef<LandmarkMode>(defaultMode);
  const [modeState, setModeState] = useState<LandmarkMode>(defaultMode);
  const [confidence, setConfidence] = useState(0);
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ frames: 0, last: Date.now() });
  const [modelLabel, setModelLabel] = useState<string | null>(null);


  // Raycaster re-used each frame
  const raycasterRef = useRef(new THREE.Raycaster());
  const targetVecRef = useRef(new THREE.Vector3());
  const ndcRef = useRef(new THREE.Vector2());

  // ── Sync canvas/renderer size ─────────────────────────────────────────────
  const syncSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    if (rendererRef.current) rendererRef.current.setSize(width, height, false);
    if (cameraThreeRef.current) {
      cameraThreeRef.current.aspect = width / height;
      cameraThreeRef.current.updateProjectionMatrix();
    }
  }, []);

  // ── Three.js initialisation ───────────────────────────────────────────────
  const initThree = useCallback(async () => {
    const canvas = canvasRef.current;
    // Always recreate if canvas exists (renderer may have been disposed)
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const { offsetWidth: w, offsetHeight: h } = canvas.parentElement!;
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 5;
    cameraThreeRef.current = camera;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dir = new THREE.DirectionalLight(0xfff4e0, 1.5);
    dir.position.set(3, 5, 5);
    scene.add(dir);

    if (modelUrl) {
      // ── Load real .glb from /public/models/ ─────────────────────────────
      const loader = new GLTFLoader();
      await new Promise<void>((resolve, reject) => {
        loader.load(
          modelUrl,
          (gltf) => {
            const model = gltf.scene;
            model.visible = true; // MUST be true because the wrapper controls visibility now!
            
            // Auto-scale: fit into a ~1-unit bounding box
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            // Re-center X and Z to the middle.
            model.position.x += (model.position.x - center.x);
            model.position.z += (model.position.z - center.z);

            // For Y, instead of centering perfectly, we want the "collar/shoulder" area to be the pivot zero point!
            // The top of the dress is box.max.y. The collar area is roughly 5% down from the top.
            const shoulderY = box.max.y - (size.y * 0.05);
            model.position.y += (model.position.y - shoulderY);

            const wrapper = new THREE.Group();
            wrapper.visible = false;
            wrapper.add(model);

            const maxDim = Math.max(size.x, size.y, size.z);
            const scaleFactor = defaultMode === "BODY" ? 8.5 : 1.2;
            wrapper.scale.setScalar(scaleFactor / maxDim);

            scene.add(wrapper);
            meshRef.current = wrapper as unknown as THREE.Object3D as any;
            setModelLabel(modelName ?? modelUrl.split("/").pop() ?? "Model");
            resolve();
          },
          undefined,
          reject,
        );
      });
    } else {
      // ── Fallback: gold fabric-swatch box ────────────────────────────────
      const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.13);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C5A55A"),
        metalness: 0.55,
        roughness: 0.38,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      scene.add(mesh);
      meshRef.current = mesh;
      setModelLabel("Fabric Swatch (placeholder)");
    }

    syncSize();
  }, [syncSize, modelUrl, modelName]);


  // ── rAF render loop (synchronous, no awaits) ──────────────────────────────
  const renderLoop = useCallback(() => {
    animFrameRef.current = requestAnimationFrame(renderLoop);

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraThreeRef.current;
    const mesh = meshRef.current;
    if (!renderer || !scene || !camera || !mesh) return;

    // FPS counter
    const fc = fpsRef.current;
    fc.frames++;
    const now = Date.now();
    if (now - fc.last >= 1000) {
      setFps(fc.frames);
      fc.frames = 0;
      fc.last = now;
    }

    const landmarks = landmarksRef.current;
    const mode = modeRef.current;

    if (landmarks) {
      if (mode === "BODY") {
        const ls = landmarks[11];
        const rs = landmarks[12];
        const lh = landmarks[23];
        const rh = landmarks[24];
        if (ls && rs && lh && rh && ls.visibility && rs.visibility && ls.visibility > 0.5) {
          const cx = (ls.x + rs.x) / 2;
          // Track the height exactly on the shoulder line, maybe 5% lower for the collarbone
          const cy = (ls.y + rs.y) / 2 + 0.05;
          const ndcX = cx * 2 - 1;
          const ndcY = -(cy * 2 - 1);
          ndcRef.current.set(ndcX, ndcY);
          raycasterRef.current.setFromCamera(ndcRef.current, camera);
          raycasterRef.current.ray.at(5, targetVecRef.current);
          
          // Push it up slightly so the collar actually sits on the shoulders instead of the mid-chest
          targetVecRef.current.y += 0.8;

          mesh.position.lerp(targetVecRef.current, 0.4);
          // Calculate how far the shoulders are leaning
          const x_diff = ls.x - rs.x; 
          const y_diff = -(ls.y - rs.y); // Negative because MediaPipe Y grows downward
          const shoulderTilt = Math.atan2(y_diff, x_diff);

          // Zero out Y rotation so it rigidly stays forward, but apply the real-time spine tilt!
          mesh.rotation.y = 0;
          mesh.rotation.z = shoulderTilt;
          
          mesh.visible = true;
          setConfidence(Math.round(ls.visibility * 100));
        } else {
          mesh.visible = false;
          setConfidence(0);
        }
      } else {
        const lm = landmarks[LANDMARKS[mode as keyof typeof LANDMARKS]];
        const vis = lm?.visibility ?? 0;
        if (lm && vis > 0.25) {
          // MediaPipe uses mirrored coords — x=0 is right side of screen
          // We mirror video, so flip x back: screenX = 1 - lm.x
          const ndcX = (1 - lm.x) * 2 - 1;
          const ndcY = -(lm.y * 2 - 1); // y=0 at top → NDC y=1 at top

          ndcRef.current.set(ndcX, ndcY);
          raycasterRef.current.setFromCamera(ndcRef.current, camera);
          raycasterRef.current.ray.at(5, targetVecRef.current);
          mesh.position.lerp(targetVecRef.current, 0.25);
          mesh.rotation.y += 0.015;
          mesh.visible = true;
          setConfidence(Math.round(vis * 100));
        } else {
          mesh.visible = false;
          setConfidence(0);
        }
      }
    } else {
      mesh.visible = false;
    }

    renderer.render(scene, camera);
  }, []);

  // ── MediaPipe Pose init ───────────────────────────────────────────────────
  const initPose = useCallback(async (videoEl: HTMLVideoElement) => {
    const [{ Pose }, { Camera }] = await Promise.all([
      import("@mediapipe/pose"),
      import("@mediapipe/camera_utils"),
    ]);

    const pose = new Pose({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results: { poseLandmarks?: PoseLandmark[] }) => {
      landmarksRef.current = results.poseLandmarks ?? null;
    });

    await pose.initialize();
    poseRef.current = pose;

    const cam = new Camera(videoEl, {
      onFrame: async () => {
        // activeRef guards against send() being called after close() (BindingError)
        if (!activeRef.current || !poseRef.current) return;
        try {
          await poseRef.current.send({ image: videoEl });
        } catch {
          // Swallow any late BindingError during shutdown
        }
      },
      width: 640,
      height: 480,
    });
    mpCameraRef.current = cam;
    await cam.start();

    setStatus("running");
  }, []);


  // ── Start AR ──────────────────────────────────────────────────────────────
  const startAR = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");
    activeRef.current = false; // reset flag before re-init
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;

      const videoEl = videoRef.current!;
      videoEl.srcObject = stream;
      await new Promise<void>((resolve) => {
        videoEl.onloadedmetadata = () => { videoEl.play(); resolve(); };
      });

      await initThree(); // async — waits for GLB load
      animFrameRef.current = requestAnimationFrame(renderLoop);

      activeRef.current = true; // enable pose.send() AFTER Three is ready
      await initPose(videoEl);
    } catch (err: unknown) {
      activeRef.current = false;
      setErrorMsg(err instanceof Error ? err.message : "Camera error");
      setStatus("error");
    }
  }, [initThree, renderLoop, initPose]);



  // ── Stop AR ───────────────────────────────────────────────────────────────
  const stopAR = useCallback(() => {
    // 1. Block any new pose.send() calls immediately
    activeRef.current = false;

    // 2. Cancel rAF
    cancelAnimationFrame(animFrameRef.current);

    // 3. Stop MediaPipe camera (stops new frames being enqueued)
    mpCameraRef.current?.stop?.();
    mpCameraRef.current = null;

    // 4. Null poseRef first so onFrame guard fires on any queued frame,
    //    then close pose after 150ms grace window (fixes BindingError)
    const poseCopy = poseRef.current;
    poseRef.current = null;
    setTimeout(() => {
      try { poseCopy?.close?.(); } catch { /* ignore late BindingError */ }
    }, 150);

    // 5. Stop webcam tracks
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    landmarksRef.current = null;

    // 6. Fully dispose Three.js so initThree rebuilds cleanly on next start
    if (meshRef.current) meshRef.current.visible = false;
    meshRef.current = null;
    rendererRef.current?.dispose();
    rendererRef.current = null;
    sceneRef.current = null;
    cameraThreeRef.current = null;

    setStatus("idle");
    setConfidence(0);
    setFps(0);
  }, []);

  // ── Mode switch ──────────────────────────────────────────────────────────
  const switchMode = useCallback((m: LandmarkMode) => {
    modeRef.current = m;
    setModeState(m);
  }, []);

  // ── Resize observer ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(syncSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [syncSize]);

  // Cleanup on unmount
  useEffect(() => () => stopAR(), [stopAR]);

  // ─────────────────────────────────────────────────────────────────────────
  const isRunning = status === "running";
  const isLoading = status === "loading";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 80px)",
        background: "#0d1721",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          padding: "14px 18px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(to bottom, rgba(13,23,33,0.88) 0%, transparent 100%)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#C5A55A",
              letterSpacing: 1,
            }}
          >
            Virtual Try-On
          </div>
          <div
            style={{
              fontFamily: "'Noto Serif Thai', serif",
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.45)",
              marginTop: 2,
            }}
          >
            MediaPipe Pose · Three.js · WebAR
          </div>
          {modelLabel && (
            <div
              style={{
                marginTop: 4,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(197,165,90,0.15)",
                border: "1px solid rgba(197,165,90,0.3)",
                borderRadius: 8,
                padding: "2px 9px",
                fontSize: "0.62rem",
                color: "#C5A55A",
                fontFamily: "'Noto Serif Thai', serif",
              }}
            >
              📦 {modelLabel}
            </div>
          )}
        </div>

        {isRunning && (
          <div style={{ display: "flex", gap: 7 }}>
            <Badge bg="#1B2A4A">{fps} fps</Badge>
            <Badge bg={confidence > 60 ? "#1f5e3a" : "#5e3a1f"}>
              {confidence}%
            </Badge>
          </div>
        )}
      </div>

      {/* ── Camera + Canvas area ────────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {/* Webcam feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
            opacity: isRunning || isLoading ? 1 : 0,
            transition: "opacity 0.5s",
          }}
        />

        {/* Three.js overlay */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            transform: "scaleX(-1)",
          }}
        />

        {/* Targeting reticle */}
        {isRunning && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                border: `1.5px dashed rgba(197,165,90,${confidence > 60 ? "0.7" : "0.25"})`,
                borderRadius: 16,
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.4s",
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: confidence > 60 ? "#4ADE80" : "#FACC15",
                  boxShadow: `0 0 14px ${confidence > 60 ? "#4ADE80" : "#FACC15"}`,
                  transition: "background 0.4s, box-shadow 0.4s",
                }}
              />
            </div>
          </div>
        )}

        {/* Idle / loading / error overlay */}
        {!isRunning && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: 28,
              textAlign: "center",
            }}
          >
            {status === "idle" && (
              <>
                <div style={{ fontSize: "3.8rem" }}>👘</div>
                <div
                  style={{
                    fontFamily: "'Noto Serif Thai', serif",
                    color: "rgba(255,255,255,0.82)",
                    fontSize: "0.92rem",
                    lineHeight: 1.7,
                  }}
                >
                  ลองสวมใส่ผ้าไทยด้วย AR
                  <br />
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>
                    กดปุ่มด้านล่างเพื่อเปิดกล้อง
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 4,
                    padding: "8px 16px",
                    borderRadius: 12,
                    background: "rgba(197,165,90,0.1)",
                    border: "1px solid rgba(197,165,90,0.25)",
                    fontSize: "0.68rem",
                    color: "rgba(197,165,90,0.8)",
                    fontFamily: "'Noto Serif Thai', serif",
                    lineHeight: 1.6,
                  }}
                >
                  🆓 ฟรี 100% · ไม่มี SDK แบบเสียเงิน<br />
                  MediaPipe WebAssembly · Three.js
                </div>
              </>
            )}
            {status === "loading" && (
              <>
                <Spinner />
                <div
                  style={{
                    fontFamily: "'Noto Serif Thai', serif",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "0.82rem",
                  }}
                >
                  กำลังโหลดโมเดล AI…
                  <br />
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem" }}>
                    (ครั้งแรกอาจใช้เวลาสักครู่)
                  </span>
                </div>
              </>
            )}
            {status === "error" && (
              <>
                <div style={{ fontSize: "2.5rem" }}>⚠️</div>
                <div
                  style={{
                    fontFamily: "'Noto Serif Thai', serif",
                    color: "#FF8080",
                    fontSize: "0.8rem",
                  }}
                >
                  {errorMsg || "ไม่สามารถเปิดกล้องได้"}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom controls ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          padding: "16px 16px 22px",
          background:
            "linear-gradient(to top, rgba(13,23,33,0.92) 0%, transparent 100%)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "center",
        }}
      >
        {/* Landmark mode selector removed to enforce full-body scaling for dresses */}

        {/* Start / Stop button */}
        <button
          id="tryon-toggle-btn"
          onClick={isRunning || isLoading ? stopAR : startAR}
          disabled={isLoading}
          style={{
            fontFamily: "'Noto Serif Thai', serif",
            fontWeight: 600,
            fontSize: "0.9rem",
            padding: "13px 52px",
            borderRadius: 36,
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            background: isRunning
              ? "linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)"
              : "linear-gradient(135deg, #C5A55A 0%, #D4BA7A 50%, #C5A55A 100%)",
            color: "#fff",
            boxShadow: isRunning
              ? "0 4px 20px rgba(231,76,60,0.35)"
              : "0 4px 20px rgba(197,165,90,0.4)",
            transition: "all 0.25s",
            letterSpacing: 0.5,
            opacity: isLoading ? 0.55 : 1,
          }}
        >
          {isLoading ? "⏳ กำลังโหลด…" : isRunning ? "⏹ หยุด AR" : "▶ เริ่ม Try-On"}
        </button>
      </div>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────
function Badge({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: "0.6rem",
        padding: "3px 9px",
        borderRadius: 18,
        background: bg,
        color: "#fff",
        letterSpacing: 0.4,
      }}
    >
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <>
      <style>{`@keyframes tryon-spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          border: "3px solid rgba(197,165,90,0.18)",
          borderTopColor: "#C5A55A",
          animation: "tryon-spin 0.75s linear infinite",
        }}
      />
    </>
  );
}
