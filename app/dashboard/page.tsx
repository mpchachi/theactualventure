"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FlappyMetrics, WaterMetrics, SlingshotMetrics } from "@/lib/telemetry/biomechanics";

type StoredFlappy    = FlappyMetrics    & { date: string };
type StoredWater     = WaterMetrics     & { date: string };
type StoredSlingshot = SlingshotMetrics & { date: string };

/* ─── Arc Gauge ──────────────────────────────────────────────────────────── */
function ArcGauge({ value, max, label, unit, animate }: {
  value: number; max: number; label: string; unit: string; animate: boolean;
}) {
  const R = 36;
  const circ = 2 * Math.PI * R;
  const arcLen = circ * 0.75;
  const pct = Math.min(1, Math.max(0, value / max));
  const fill = animate ? arcLen * pct : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: 92, height: 92 }}>
        <svg viewBox="0 0 100 100" width="92" height="92">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#dce5d4" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circ - arcLen}`} transform="rotate(135 50 50)" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="#7d9b76" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${fill} ${circ - fill}`} transform="rotate(135 50 50)"
            style={{ transition: "stroke-dasharray 1.3s cubic-bezier(0.16,1,0.3,1)" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#1a1c18", lineHeight: 1, fontFamily: "'Syne', ui-sans-serif" }}>
            {value.toFixed(0)}
          </span>
          <span style={{ fontSize: 8, fontWeight: 700, color: "#7d9b76", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 1 }}>
            {unit}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: "0.13em", textAlign: "center", maxWidth: 82 }}>
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
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: "0.13em" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#1a1c18" }}>{pct.toFixed(0)}%</span>
      </div>
      <div style={{ height: 5, background: "#dce5d4", borderRadius: 999 }}>
        <div style={{
          height: "100%",
          width: animate ? `${pct}%` : "0%",
          background: color, borderRadius: 999,
          transition: "width 1.3s cubic-bezier(0.16,1,0.3,1)",
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
      padding: "9px 13px",
      background: "rgba(255,255,255,0.55)",
      border: "1px solid rgba(125,155,118,0.2)",
      borderRadius: 10,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: "0.13em" }}>{label}</span>
      <span style={{
        fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 999,
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
      padding: "11px 12px",
      background: "rgba(255,255,255,0.5)",
      borderRadius: 12,
      border: "1px solid rgba(125,155,118,0.18)",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 8, fontWeight: 700, color: "#7d9b76", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 300, color: warn ? "#b03020" : "#1a1c18", lineHeight: 1 }}>
        {value}<span style={{ fontSize: 11, marginLeft: 2, fontWeight: 500 }}>{unit}</span>
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────────────────────── */
function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
      <span style={{
        fontSize: 42, fontWeight: 900, lineHeight: 1, flexShrink: 0,
        color: "rgba(125,155,118,0.22)",
        fontFamily: "'Syne', ui-sans-serif",
      }}>{number}</span>
      <div>
        <h2 style={{
          fontSize: 19, fontWeight: 800, color: "#1a1c18",
          margin: "0 0 2px", lineHeight: 1.1,
          fontFamily: "'Syne', ui-sans-serif",
        }}>{title}</h2>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#7d9b76", textTransform: "uppercase", letterSpacing: "0.2em" }}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(125,155,118,0.16)", margin: "0 0 32px" }} />;
}

function EmptyState() {
  return (
    <div style={{
      padding: "22px", textAlign: "center",
      background: "rgba(255,255,255,0.35)",
      border: "1px dashed rgba(125,155,118,0.28)",
      borderRadius: 16,
    }}>
      <p style={{ fontSize: 13, color: "#7d9b76", margin: 0, fontStyle: "italic" }}>Sin datos para este módulo</p>
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

      {/* Decoración */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <svg style={{ position: "absolute", top: 20, right: "4%", width: 130, opacity: 0.32 }} viewBox="0 0 130 75" fill="#a8c0a0">
          <path d="M16 54 L50 18 L82 42 L114 26 L102 62 L28 66 Z" />
        </svg>
        <svg style={{ position: "absolute", top: "35%", left: "1%", width: 65, opacity: 0.18 }} viewBox="0 0 100 60" fill="#c4d3ba">
          <path d="M6 42 L28 14 L70 36 L95 20 L85 54 L12 54 Z" />
        </svg>
        <svg style={{ position: "absolute", bottom: "20%", right: "2%", width: 90, opacity: 0.22 }} viewBox="0 0 100 60" fill="#dce5d4">
          <path d="M4 44 L34 10 L74 38 L97 18 L87 56 L14 56 Z" />
        </svg>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.036, mixBlendMode: "multiply",
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"
        }} />
      </div>

      {/* Contenido */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#7d9b76", marginBottom: 12 }}>
              fixedgap · Resultados
            </p>
            <h1 style={{
              fontFamily: "'Syne', ui-sans-serif",
              fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
              fontWeight: 900, lineHeight: 1.0,
              letterSpacing: "-0.025em", color: "#1a1c18",
              margin: "0 0 8px",
            }}>
              Sesión<br />
              <em style={{ color: "#7d9b76", fontStyle: "italic" }}>completada.</em>
            </h1>
            <p style={{ fontSize: 12, color: "#4a4a4a", margin: 0, textTransform: "capitalize" }}>{dateStr}</p>
          </div>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 999,
            background: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(125,155,118,0.28)",
            fontSize: 11, fontWeight: 700, color: "#4a4a4a",
            textDecoration: "none", letterSpacing: "0.04em",
            backdropFilter: "blur(4px)", whiteSpace: "nowrap", marginTop: 6,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver
          </Link>
        </div>

        {/* ── TIRACHINAS ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: 32 }}>
          <SectionHeader number="01" title="Tirachinas" subtitle="Agarre Proximal" />
          {slingshot ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{
                background: "rgba(255,255,255,0.58)", borderRadius: 20,
                padding: "20px 12px", border: "1px solid rgba(125,155,118,0.18)",
                display: "flex", justifyContent: "space-around", alignItems: "center",
              }}>
                <ArcGauge value={slingshot.maxPinchOpen * 100} max={100} label="Apertura Pinza" unit="%" animate={animate} />
                <ArcGauge value={slingshot.accuracyRatio * 100} max={100} label="Precisión" unit="%" animate={animate} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
                <Bar label="Extensión Proximal" value={slingshot.maxPullDistance} max={300} animate={animate} />
                <StatusBadge label="Temblor de Tracción" ok={slingshot.pullTremor <= 10} okText="Estable" alertText="Ataxia" />
              </div>
            </div>
          ) : <EmptyState />}
        </section>

        <Divider />

        {/* ── AVIÓN ──────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 32 }}>
          <SectionHeader number="02" title="Avión" subtitle="Flexoextensión Distal" />
          {flappy ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{
                background: "rgba(255,255,255,0.58)", borderRadius: 20,
                padding: "20px 12px", border: "1px solid rgba(125,155,118,0.18)",
                display: "flex", justifyContent: "space-around", alignItems: "center",
              }}>
                <ArcGauge value={flappy.maxExtension * 100} max={100} label="Extensión ROM" unit="%" animate={animate} />
                <ArcGauge value={flappy.maxFlexion * 100} max={100} label="Flexión ROM" unit="%" animate={animate} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <StatBox label="Activaciones" value={flappy.activationCount} />
                  <StatBox label="Fatiga" value={Math.abs(flappy.fatigueIndex * 100).toFixed(0)} unit="%" warn={flappy.fatigueIndex < -0.15} />
                </div>
                <StatusBadge label="Espasticidad" ok={flappy.smoothnessJerk <= 5} okText="Fluido" alertText="Rigidez" />
              </div>
            </div>
          ) : <EmptyState />}
        </section>

        <Divider />

        {/* ── AGUA ───────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 32 }}>
          <SectionHeader number="03" title="Agua" subtitle="Pronosupinación" />
          {water ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{
                background: "rgba(255,255,255,0.58)", borderRadius: 20,
                padding: "20px 12px", border: "1px solid rgba(125,155,118,0.18)",
                display: "flex", justifyContent: "space-around", alignItems: "center",
              }}>
                <ArcGauge value={Math.abs(water.maxPronation * (180 / Math.PI))} max={90} label="Pronación" unit="°" animate={animate} />
                <ArcGauge value={Math.abs(water.maxSupination * (180 / Math.PI))} max={90} label="Supinación" unit="°" animate={animate} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                <Bar label="Precisión de agua" value={water.waterAccuracy * 100} max={100} animate={animate} />
                <Bar label="Error de veneno" value={water.poisonError * 100} max={100} color="#b03020" animate={animate} />
                <StatusBadge label="Temblor rotacional" ok={water.smoothnessJerk <= 20} okText="Giro Suave" alertText="Inestable" />
              </div>
            </div>
          ) : <EmptyState />}
        </section>

        {/* Footer CTA */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 999,
            background: "#7d9b76", color: "#f5f0e8",
            fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
            textTransform: "uppercase", textDecoration: "none",
            boxShadow: "0 8px 22px -8px rgba(125,155,118,0.55)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  );
}
