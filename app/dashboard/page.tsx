"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FlappyMetrics, WaterMetrics, SlingshotMetrics } from "@/lib/telemetry/biomechanics";

type StoredFlappy    = FlappyMetrics    & { date: string; score?: number; durationSeconds?: number };
type StoredWater     = WaterMetrics     & { date: string };
type StoredSlingshot = SlingshotMetrics & { date: string; totalShots?: number };

/* ─── Arc Gauge ──────────────────────────────────────────────────────────── */
function ArcGauge({ value, max, label, unit, animate }: {
  value: number; max: number; label: string; unit: string; animate: boolean;
}) {
  const R = 52;
  const circ = 2 * Math.PI * R;
  const arcLen = circ * 0.75;
  const pct = Math.min(1, Math.max(0, value / max));
  const fill = animate ? arcLen * pct : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 128, height: 128 }}>
        <svg viewBox="0 0 120 120" width="128" height="128">
          <circle cx="60" cy="60" r={R} fill="none" stroke="#dce5d4" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circ - arcLen}`} transform="rotate(135 60 60)" />
          <circle cx="60" cy="60" r={R} fill="none" stroke="#7d9b76" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${fill} ${circ - fill}`} transform="rotate(135 60 60)"
            style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.16,1,0.3,1)" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: "#1a1c18", lineHeight: 1, fontFamily: "'Syne', ui-sans-serif" }}>
            {value.toFixed(0)}
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#7d9b76", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>
            {unit}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#5a5a52", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "center", maxWidth: 100 }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Progress Bar ───────────────────────────────────────────────────────── */
function Bar({ label, value, max = 100, color = "#7d9b76", animate }: {
  label: string; value: number; max?: number; color?: string; animate: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#5a5a52", textTransform: "uppercase", letterSpacing: "0.13em" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1c18" }}>{pct.toFixed(0)}%</span>
      </div>
      <div style={{ height: 6, background: "#dce5d4", borderRadius: 999 }}>
        <div style={{
          height: "100%",
          width: animate ? `${pct}%` : "0%",
          background: color, borderRadius: 999,
          transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────────── */
function StatusBadge({ label, ok, okText = "Estable", alertText = "Detectado" }: {
  label: string; ok: boolean; okText?: string; alertText?: string;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 14px",
      background: "rgba(255,255,255,0.5)",
      border: "1px solid rgba(125,155,118,0.18)",
      borderRadius: 12,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#5a5a52", textTransform: "uppercase", letterSpacing: "0.13em" }}>{label}</span>
      <span style={{
        fontSize: 10, fontWeight: 800, padding: "3px 11px", borderRadius: 999,
        background: ok ? "rgba(125,155,118,0.15)" : "rgba(192,57,43,0.11)",
        color: ok ? "#5a7a54" : "#b03020",
        letterSpacing: "0.04em",
      }}>
        {ok ? okText : alertText}
      </span>
    </div>
  );
}

/* ─── Stat Box ───────────────────────────────────────────────────────────── */
function StatBox({ label, value, unit = "", warn = false }: {
  label: string; value: string | number; unit?: string; warn?: boolean;
}) {
  return (
    <div style={{
      padding: "14px 16px",
      background: "rgba(255,255,255,0.5)",
      borderRadius: 14,
      border: "1px solid rgba(125,155,118,0.18)",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 8, fontWeight: 700, color: "#7d9b76", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 300, color: warn ? "#b03020" : "#1a1c18", lineHeight: 1 }}>
        {value}<span style={{ fontSize: 13, marginLeft: 3, fontWeight: 500 }}>{unit}</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      padding: "28px", textAlign: "center",
      background: "rgba(255,255,255,0.35)",
      border: "1px dashed rgba(125,155,118,0.28)",
      borderRadius: 16, gridColumn: "1 / -1",
    }}>
      <p style={{ fontSize: 13, color: "#7d9b76", margin: 0, fontStyle: "italic" }}>Sin datos para este módulo</p>
    </div>
  );
}

/* ─── Game Card ──────────────────────────────────────────────────────────── */
function GameCard({ number, title, subtitle, children }: {
  number: string; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.52)",
      border: "1px solid rgba(125,155,118,0.2)",
      borderRadius: 24,
      padding: "28px 32px",
      backdropFilter: "blur(4px)",
    }}>
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24, borderBottom: "1px solid rgba(125,155,118,0.13)", paddingBottom: 16 }}>
        <span style={{
          fontSize: 36, fontWeight: 900, lineHeight: 1, flexShrink: 0,
          color: "rgba(125,155,118,0.25)",
          fontFamily: "'Syne', ui-sans-serif",
        }}>{number}</span>
        <div>
          <h2 style={{
            fontSize: 20, fontWeight: 800, color: "#1a1c18",
            margin: "0 0 2px", lineHeight: 1.1,
            fontFamily: "'Syne', ui-sans-serif",
          }}>{title}</h2>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#7d9b76", textTransform: "uppercase", letterSpacing: "0.22em" }}>
            {subtitle}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [flappy,    setFlappy]    = useState<StoredFlappy | null>(null);
  const [water,     setWater]     = useState<StoredWater | null>(null);
  const [slingshot, setSlingshot] = useState<StoredSlingshot | null>(null);
  const [mounted,   setMounted]   = useState(false);
  const [animate,   setAnimate]   = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const fh = JSON.parse(localStorage.getItem("clinical_metrics_flappy")    || "[]");
      const wh = JSON.parse(localStorage.getItem("clinical_metrics_water")     || "[]");
      const sh = JSON.parse(localStorage.getItem("clinical_metrics_slingshot") || "[]");
      if (fh.length) setFlappy(fh[fh.length - 1]);
      if (wh.length) setWater(wh[wh.length - 1]);
      if (sh.length) setSlingshot(sh[sh.length - 1]);
    } catch {}
    const t = setTimeout(() => setAnimate(true), 120);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  const sessionDate = flappy?.date || water?.date || slingshot?.date;
  const dateStr = sessionDate
    ? new Date(sessionDate).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
    : "Sesión de evaluación";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f0e8",
      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      color: "#1a1c18",
      position: "relative",
      overflowX: "hidden",
    }}>

      {/* Decoración lateral */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Top right polygon */}
        <svg style={{ position: "absolute", top: 28, right: "3%", width: 180, opacity: 0.28 }} viewBox="0 0 180 100" fill="#a8c0a0">
          <path d="M20 72 L64 22 L110 54 L156 30 L140 84 L36 88 Z" />
        </svg>
        {/* Mid left polygon */}
        <svg style={{ position: "absolute", top: "28%", left: "1.5%", width: 110, opacity: 0.2 }} viewBox="0 0 120 80" fill="#c4d3ba">
          <path d="M8 56 L32 18 L84 44 L112 26 L100 68 L16 68 Z" />
        </svg>
        {/* Bottom right polygon */}
        <svg style={{ position: "absolute", bottom: "18%", right: "2%", width: 130, opacity: 0.2 }} viewBox="0 0 130 80" fill="#dce5d4">
          <path d="M6 58 L44 14 L96 48 L124 24 L112 72 L18 72 Z" />
        </svg>
        {/* Bottom left small */}
        <svg style={{ position: "absolute", bottom: "8%", left: "2%", width: 72, opacity: 0.15 }} viewBox="0 0 80 50" fill="#a8c0a0">
          <path d="M4 36 L18 10 L52 28 L76 14 L66 44 L10 44 Z" />
        </svg>
        {/* Grain */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.036, mixBlendMode: "multiply",
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"
        }} />
      </div>

      {/* Contenido */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "48px 48px 96px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 52 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "#7d9b76", marginBottom: 14 }}>
              Informe · Resultados
            </p>
            <h1 style={{
              fontFamily: "'Syne', ui-sans-serif",
              fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
              fontWeight: 900, lineHeight: 1.0,
              letterSpacing: "-0.03em", color: "#1a1c18",
              margin: "0 0 10px",
            }}>
              Sesión<br />
              <em style={{ color: "#7d9b76", fontStyle: "italic" }}>completada.</em>
            </h1>
            <p style={{ fontSize: 13, color: "#5a5a52", margin: 0, textTransform: "capitalize" }}>{dateStr}</p>
          </div>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 999,
            background: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(125,155,118,0.3)",
            fontSize: 11, fontWeight: 700, color: "#4a4a4a",
            textDecoration: "none", letterSpacing: "0.05em",
            backdropFilter: "blur(4px)", whiteSpace: "nowrap", marginTop: 8,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver
          </Link>
        </div>

        {/* ── Three game cards ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* TIRACHINAS */}
          <GameCard number="01" title="Tirachinas" subtitle="Agarre Proximal">
            {slingshot ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, alignItems: "center" }}>
                {/* Gauges */}
                <div style={{
                  background: "rgba(248,246,240,0.7)", borderRadius: 18,
                  padding: "24px 16px", border: "1px solid rgba(125,155,118,0.14)",
                  display: "flex", justifyContent: "space-around", alignItems: "center",
                }}>
                  <ArcGauge value={slingshot.maxPinchOpen * 100} max={100} label="Apertura Pinza" unit="%" animate={animate} />
                  <ArcGauge value={slingshot.accuracyRatio * 100} max={100} label="Precisión" unit="%" animate={animate} />
                </div>
                {/* Bar */}
                <div style={{ padding: "0 8px" }}>
                  <Bar label="Extensión Proximal" value={slingshot.maxPullDistance} max={300} animate={animate} />
                  <Bar label="Rango de movimiento" value={slingshot.accuracyRatio * 100} max={100} animate={animate} />
                </div>
                {/* Status */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <StatusBadge label="Temblor de Tracción" ok={slingshot.pullTremor <= 3} okText="Estable" alertText="Ataxia" />
                  <StatBox label="Disparos" value={slingshot.totalShots ?? "—"} />
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr" }}><EmptyState /></div>
            )}
          </GameCard>

          {/* AVIÓN */}
          <GameCard number="02" title="Avión" subtitle="Flexoextensión Distal">
            {flappy ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, alignItems: "center" }}>
                {/* Gauges */}
                <div style={{
                  background: "rgba(248,246,240,0.7)", borderRadius: 18,
                  padding: "24px 16px", border: "1px solid rgba(125,155,118,0.14)",
                  display: "flex", justifyContent: "space-around", alignItems: "center",
                }}>
                  <ArcGauge value={(1 - flappy.maxExtension) * 100} max={100} label="Extensión ROM" unit="%" animate={animate} />
                  <ArcGauge value={flappy.maxFlexion * 100} max={100} label="Flexión ROM" unit="%" animate={animate} />
                </div>
                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <StatBox label="Activaciones" value={flappy.activationCount} />
                  <StatBox label="Fatiga" value={Math.abs(flappy.fatigueIndex * 100).toFixed(0)} unit="%" warn={flappy.fatigueIndex < -0.15} />
                  <StatBox label="Puntaje" value={flappy.score ?? "—"} />
                  <StatBox label="Duración" value={flappy.durationSeconds ? `${flappy.durationSeconds}s` : "—"} />
                </div>
                {/* Status */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <StatusBadge label="Espasticidad" ok={flappy.smoothnessJerk <= 3} okText="Fluido" alertText="Rigidez" />
                  <Bar label="Suavidad" value={Math.max(0, 100 - flappy.smoothnessJerk * 20)} max={100} animate={animate} />
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr" }}><EmptyState /></div>
            )}
          </GameCard>

          {/* AGUA */}
          <GameCard number="03" title="Agua" subtitle="Pronosupinación">
            {water ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, alignItems: "center" }}>
                {/* Gauges */}
                <div style={{
                  background: "rgba(248,246,240,0.7)", borderRadius: 18,
                  padding: "24px 16px", border: "1px solid rgba(125,155,118,0.14)",
                  display: "flex", justifyContent: "space-around", alignItems: "center",
                }}>
                  <ArcGauge value={Math.abs(water.maxPronation * (180 / Math.PI))} max={90} label="Pronación" unit="°" animate={animate} />
                  <ArcGauge value={Math.abs(water.maxSupination * (180 / Math.PI))} max={90} label="Supinación" unit="°" animate={animate} />
                </div>
                {/* Bars */}
                <div style={{ padding: "0 8px" }}>
                  <Bar label="Precisión de agua" value={water.waterAccuracy * 100} max={100} animate={animate} />
                  <Bar label="Error de veneno" value={water.poisonError * 100} max={100} color="#b03020" animate={animate} />
                </div>
                {/* Status */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <StatusBadge label="Temblor rotacional" ok={water.smoothnessJerk <= 3} okText="Giro Suave" alertText="Inestable" />
                  <StatBox label="Arco de rotación" value={Math.abs((water.maxPronation + water.maxSupination) * (180 / Math.PI)).toFixed(0)} unit="°" />
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr" }}><EmptyState /></div>
            )}
          </GameCard>

        </div>

        {/* Footer CTA */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 32px", borderRadius: 999,
            background: "#7d9b76", color: "#f5f0e8",
            fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
            textTransform: "uppercase", textDecoration: "none",
            boxShadow: "0 8px 24px -8px rgba(125,155,118,0.55)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Nueva sesión
          </Link>
        </div>

      </div>
    </div>
  );
}
