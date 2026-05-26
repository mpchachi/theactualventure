"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const WaterGame = dynamic(() => import("@/components/WaterGame"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw", background: "#eaf0f4" }}>
      <p style={{ color: "#94a3b8", fontSize: 18, fontWeight: 300, letterSpacing: "0.06em" }}>Cargando juego...</p>
    </div>
  ),
});

function SkipButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 999,
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "10px 18px", borderRadius: 999,
        background: hovered ? "rgba(245,240,232,0.98)" : "rgba(245,240,232,0.72)",
        border: "1px solid rgba(125,155,118,0.4)",
        backdropFilter: "blur(8px)",
        fontSize: 12, fontWeight: 700, color: "#1a1c18",
        letterSpacing: "0.05em", cursor: "pointer",
        boxShadow: "0 4px 16px -4px rgba(0,0,0,0.18)",
        transition: "background 180ms, transform 140ms",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        fontFamily: "'Plus Jakarta Sans', ui-sans-serif",
      }}
    >
      {label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function WaterPage() {
  const router = useRouter();
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    setTestMode(new URLSearchParams(window.location.search).get("mode") === "test");
  }, []);

  function handleSkip() {
    router.push("/dashboard");
  }

  return (
    <>
      <WaterGame />
      <SkipButton label="Resultados" onClick={handleSkip} />
    </>
  );
}
