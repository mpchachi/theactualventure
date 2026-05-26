"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PronationDetector } from "@/lib/pronation-detector";
import { SessionLogger } from "@/lib/telemetry/datalogger";
import { BiomechanicsDSP } from "@/lib/telemetry/biomechanics";
import { WaterEngine, type WaterState } from "@/lib/water-logic";
import { WaterSceneManager } from "@/lib/water-scene";
import { visionSession } from "@/lib/vision-session";
import Link from "next/link";

export default function WaterGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Iniciando cámara...");
  const [engineState, setEngineState] = useState<WaterState | null>(null);

  // Countdown state (5, 4, 3, 2, 1, 0 -> starts game)
  const [countdown, setCountdown] = useState<number | null>(null);

  const engineRef = useRef<WaterEngine | null>(null);
  const restartTriggerRef = useRef<(() => void) | null>(null);
  
  // To pass data from the CV thread to the animation loop
  const pitcherRotRef = useRef<number>(0);
  const isPouringRef = useRef<boolean>(false);

  // Countdown timer effect
  useEffect(() => {
    if (!ready) return;
    if (countdown === null) return;

    if (countdown === 0) {
      const timer = setTimeout(() => {
        setCountdown(null);
        restartTriggerRef.current?.();
      }, 700);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [ready, countdown]);

  useEffect(() => {
    if (ready) {
      setCountdown(5);
    }
  }, [ready]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let disposed = false;

    // 1. Initialize Scene & Engine
    const sceneManager = new WaterSceneManager(canvas);
    const engine = new WaterEngine();
    engineRef.current = engine;
    setEngineState(engine.getState());

    const detector = new PronationDetector();
    const sessionLogger = new SessionLogger();

    restartTriggerRef.current = () => {
      engine.startLevel();
      setEngineState(engine.getState());
      sessionLogger.start();
    };

    // 2. Render loop
    let animId: number;
    let lastTime = performance.now();

    function animate() {
      if (disposed) return;
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const deltaTime = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const prevState = engine.getState().phase;
      const updated = engine.update(pitcherRotRef.current, deltaTime);
      setEngineState(updated);
      sceneManager.update(updated, pitcherRotRef.current);

      if (prevState !== "success" && updated.phase === "success") {
          const frames = sessionLogger.stop();
          if (frames.length >= 10) {
            const metrics = BiomechanicsDSP.processWaterMetrics(frames);
            console.log("CLINICAL METRICS (Water):", metrics);

            try {
              const history = JSON.parse(localStorage.getItem("clinical_metrics_water") || "[]");
              history.push({ date: new Date().toISOString(), ...metrics });
              localStorage.setItem("clinical_metrics_water", JSON.stringify(history));
            } catch (e) {
              console.error("Error saving clinical metrics:", e);
            }
          }

          if (typeof window !== "undefined") {
            setTimeout(() => {
              if (window.location.search.includes('mode=test')) {
                visionSession.stop();
                router.push('/dashboard');
              } else {
                visionSession.stop();
                router.push('/');
              }
            }, 3500);
          }
      }

      sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
    }
    animate();

    function onResize() {
      sceneManager.resize();
    }
    window.addEventListener("resize", onResize);

    // 3. Vision session (shared camera + MediaPipe)
    let unsubVision: (() => void) | null = null;

    async function startVision() {
      setStatus("Iniciando visión...");
      await visionSession.start();
      setReady(true);

      unsubVision = visionSession.subscribe((frame) => {
        if (disposed) return;
        if (frame) {
          const pronationRes = detector.update(frame.landmarks);
          const targetRot = pronationRes.pitcherRotationZ;
          const currentRot = pitcherRotRef.current;

          let diff = targetRot - currentRot;
          while (diff > Math.PI) diff -= 2 * Math.PI;
          while (diff < -Math.PI) diff += 2 * Math.PI;

          let step = diff * 0.08;
          const maxStep = 0.06;
          if (step > maxStep) step = maxStep;
          if (step < -maxStep) step = -maxStep;

          pitcherRotRef.current = currentRot + step;

          const st = engineRef.current?.getState();
          if (st) {
            sessionLogger.logFrame(st.phase, {
              pitcherRotationZ: currentRot + step,
              glassCurrentVolume: st.glassCurrentVolume,
              glassTargetVolume: st.glassTargetVolume,
              glassPoisonVolume: st.glassPoisonVolume,
              round: st.round,
            });
          }
        }
      });
    }

    startVision().catch((err) => {
      console.error("WaterGame error:", err);
      setStatus("Error: " + (err instanceof Error ? err.message : String(err)));
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      sceneManager.dispose();
      unsubVision?.();
    };
  }, []);

  const handleRestart = () => {
    setCountdown(5);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f1f5f9] select-none">
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Loading Overlay */}
      {!ready && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#fcfcfc] backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-light tracking-wide">{status}</p>
        </div>
      )}

      {/* Countdown Overlay */}
      {ready && countdown !== null && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <div className="text-center animate-in zoom-in duration-300">
            <span className="block text-9xl font-black text-slate-800 drop-shadow-sm tracking-tighter">
              {countdown === 0 ? "¡YA!" : countdown}
            </span>
          </div>
        </div>
      )}

      {/* Main UI Overlay */}
      {ready && countdown === null && engineState && (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start w-full max-w-5xl mx-auto">
            <div className="pointer-events-auto">
              <Link
                href="/"
                className="inline-flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 hover:shadow-md transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Ronda</span>
                <span className="text-2xl font-light text-slate-700 leading-none">{engineState.round} <span className="text-sm text-slate-400">/ 3</span></span>
              </div>
            </div>
          </div>

          {/* Bottom Bar / Notifications */}
          <div className="w-full max-w-xl mx-auto text-center pointer-events-auto">
            {engineState.phase === "waiting" && (
              <div className="bg-white/90 backdrop-blur-md py-4 px-12 inline-block rounded-full shadow-lg border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                <span className="text-xl font-medium tracking-wide text-slate-700">¡Gira la jarra para llenarla!</span>
              </div>
            )}
            
            {engineState.phase === "pouring" && (
              <div className="bg-white/90 backdrop-blur-md py-4 px-8 rounded-3xl shadow-lg border border-slate-100 animate-in slide-in-from-bottom-10">
                <div className="w-full bg-slate-100 rounded-full h-2 mt-1 overflow-hidden border border-slate-200">
                  <div 
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-75 ease-linear"
                    style={{ width: `${Math.min(100, (engineState.stabilityTimer / 1.0) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-2 block">
                  {engineState.stabilityTimer > 0 ? "¡Mantén la posición!" : "Agua al vaso (Izq) | Veneno a la basura (Der)"}
                </span>
              </div>
            )}
            {/* Phase Success - Automatic Redirect to Menu */}
            {engineState.phase === "success" && (
              <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-slate-100 animate-in zoom-in-95">
                <h2 className="text-2xl font-medium text-slate-800 mb-2">¡Sesión Completada!</h2>
                {typeof window !== 'undefined' && window.location.search.includes('mode=test') ? (
                  <p className="text-indigo-500 font-medium">Test finalizado. Redirigiendo al Dashboard Clínico...</p>
                ) : (
                  <p className="text-slate-500 font-light">Volviendo al menú principal...</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
