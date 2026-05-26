"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const Slingshot = () => (
  <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
    <path d="M30 20 L40 60 L50 80 L60 60 L70 20" stroke="#7d9b76" strokeWidth="5" strokeLinejoin="bevel" />
    <circle cx="50" cy="34" r="7" fill="#1a1c18" />
    <path d="M30 20 Q50 42 70 20" stroke="#1a1c18" strokeWidth="2.5" fill="none" />
  </svg>
);

const Plane = () => (
  <svg width="68" height="68" viewBox="0 0 100 100">
    <path d="M18 52 L78 28 L58 56 L78 82 Z" fill="#7d9b76" />
    <path d="M58 56 L78 28 L78 82 Z" fill="#a8c0a0" opacity="0.65" />
  </svg>
);

const Drop = () => (
  <svg width="68" height="68" viewBox="0 0 100 100">
    <path d="M50 18 L76 62 L50 92 L24 62 Z" fill="#7d9b76" />
    <path d="M50 18 L50 92 L76 62 Z" fill="#a8c0a0" opacity="0.65" />
  </svg>
);

const games = [
  { id: "tirachinas", number: "01", title: "Tirachinas", tagline: "Apunta, tensa y domina la parábola perfecta.", label: "Agarre proximal", href: "/game",   Icon: Slingshot },
  { id: "avion",      number: "02", title: "Avión",      tagline: "Planifica tu vuelo entre corrientes de papel.", label: "Muñeca y dedos",  href: "/flappy", Icon: Plane },
  { id: "agua",       number: "03", title: "Agua",       tagline: "Controla el caudal con precisión milimétrica.", label: "Pronosupinación", href: "/water",  Icon: Drop },
];

export default function Home() {
  const router = useRouter();

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#f5f0e8",
      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Decoración de fondo ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <svg style={{ position: "absolute", top: "5%", left: "5%", width: 110, opacity: 0.36, animation: "lp-float 9s ease-in-out infinite" }} viewBox="0 0 100 60" fill="#dce5d4">
          <path d="M8 42 L30 16 L60 32 L90 10 L80 50 L18 54 Z" />
        </svg>
        <svg style={{ position: "absolute", top: "7%", right: "6%", width: 160, opacity: 0.52, animation: "lp-float 7s ease-in-out infinite" }} viewBox="0 0 130 75" fill="#a8c0a0">
          <path d="M16 54 L50 18 L82 42 L114 26 L102 62 L28 66 Z" />
        </svg>
        <svg style={{ position: "absolute", top: "48%", left: "1.5%", width: 78, opacity: 0.18, animation: "lp-drift 22s ease-in-out infinite alternate" }} viewBox="0 0 100 60" fill="#c4d3ba">
          <path d="M6 42 L28 14 L70 36 L95 20 L85 54 L12 54 Z" />
        </svg>
        <svg style={{ position: "absolute", top: "40%", right: "2%", width: 88, opacity: 0.26, animation: "lp-float 11s ease-in-out infinite" }} viewBox="0 0 100 60" fill="#dce5d4">
          <path d="M4 44 L34 10 L74 38 L97 18 L87 56 L14 56 Z" />
        </svg>
        {/* Montañas */}
        <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 130 }} viewBox="0 0 1440 130" preserveAspectRatio="none">
          <path d="M0 130 L260 40 L520 130 L800 48 L1080 118 L1380 42 L1440 68 L1440 130 Z" fill="#dce5d4" opacity="0.92" />
          <path d="M0 130 L380 58 L660 118 L940 36 L1200 94 L1440 58 L1440 130 Z" fill="#a8c0a0" opacity="0.88" />
          <rect x="0" y="112" width="1440" height="18" fill="#7d9b76" />
        </svg>
        <div style={{ position: "absolute", inset: 0, opacity: 0.038, mixBlendMode: "multiply", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />
      </div>

      {/* ── Contenido principal ── */}
      <div style={{
        position: "relative", zIndex: 1,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        maxWidth: 980,
        width: "100%",
        margin: "0 auto",
        padding: "5vh 32px 140px",
        gap: "4vh",
      }}>

        {/* Hero */}
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.26em", textTransform: "uppercase",
            color: "#7d9b76", marginBottom: "1.2em",
          }}>
            Mini-juegos · Low-poly
          </p>
          <h1 style={{
            fontFamily: "'Syne', 'Plus Jakarta Sans', ui-sans-serif",
            fontSize: "clamp(2.6rem, 4.8vw, 4.2rem)",
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: "#1a1c18",
            marginBottom: "0.55em",
          }}>
            Pequeños mundos,<br />
            <em style={{ color: "#7d9b76", fontStyle: "italic" }}>grandes partidas.</em>
          </h1>
          <p style={{
            fontSize: "clamp(0.8rem, 1.1vw, 0.95rem)",
            lineHeight: 1.65,
            color: "#4a4a4a",
            maxWidth: 420,
            margin: "0 auto 1.4em",
          }}>
            Tres experiencias táctiles hechas a mano para explorar la física del control. Calibra tu pulso o lánzate directo a la acción.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/game?mode=test")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "0.7em 1.6em", borderRadius: 999,
                background: "#7d9b76", color: "#f5f0e8",
                fontSize: "clamp(0.65rem, 0.9vw, 0.78rem)",
                fontWeight: 800, letterSpacing: "0.08em",
                textTransform: "uppercase", border: "none", cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 6px 20px -6px rgba(125,155,118,0.55)",
                transition: "background 180ms, transform 140ms",
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#1a1c18"; b.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#7d9b76"; b.style.transform = "translateY(0)"; }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Iniciar test
            </button>
            <a href="/tracker" style={{
              fontSize: "clamp(0.72rem, 0.95vw, 0.82rem)",
              fontWeight: 600, color: "#7d9b76",
              textDecoration: "none", whiteSpace: "nowrap",
            }}>
              Saltar al tracker →
            </a>
          </div>
        </div>

        {/* Cards */}
        <div style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.2vw",
          minHeight: 0,
        }}>
          {games.map(({ id, number, title, tagline, label, href, Icon }) => (
            <Link key={id} href={href} style={{ textDecoration: "none", display: "flex" }}>
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(2px)",
                  border: "1px solid rgba(210,218,205,0.7)",
                  borderRadius: "1.4rem",
                  padding: "1.4rem 1.4rem 1.1rem",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  boxShadow: "0 2px 12px -4px rgba(125,155,118,0.12), 0 1px 3px rgba(0,0,0,0.04)",
                  transition: "transform 260ms ease, box-shadow 260ms ease",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(-8px)";
                  el.style.boxShadow = "0 22px 44px -14px rgba(125,155,118,0.32), 0 4px 10px -4px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 2px 12px -4px rgba(125,155,118,0.12), 0 1px 3px rgba(0,0,0,0.04)";
                }}
              >
                {/* Top */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{
                    fontFamily: "'Syne', ui-sans-serif",
                    fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)",
                    fontWeight: 900, lineHeight: 1,
                    color: "rgba(125,155,118,0.25)",
                  }}>
                    {number}
                  </span>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    border: "1px solid rgba(125,155,118,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#4a4a4a", flexShrink: 0,
                    transition: "background 220ms, color 220ms",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Icono */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon />
                </div>

                {/* Footer */}
                <div>
                  <p style={{
                    fontFamily: "'Syne', ui-sans-serif",
                    fontSize: "clamp(0.95rem, 1.3vw, 1.15rem)",
                    fontWeight: 700, color: "#1a1c18", margin: "0 0 0.25em",
                  }}>{title}</p>
                  <p style={{
                    fontSize: "clamp(0.65rem, 0.85vw, 0.78rem)",
                    color: "#6a6a6a", lineHeight: 1.5, margin: "0 0 0.7em",
                  }}>{tagline}</p>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderTop: "1px solid rgba(125,155,118,0.18)",
                    paddingTop: "0.55em", gap: 6,
                  }}>
                    <span style={{
                      fontSize: "clamp(0.5rem, 0.65vw, 0.58rem)",
                      fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.14em", color: "#7d9b76",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: "clamp(0.55rem, 0.7vw, 0.62rem)",
                      fontWeight: 800, color: "#1a1c18",
                      whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.05em",
                    }}>
                      JUGAR
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* Calibración esquina */}
      <div style={{ position: "absolute", bottom: 10, right: 16, zIndex: 10 }}>
        <Link href="/tracker" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7d9b76", textDecoration: "none", opacity: 0.55 }}>
          fixedgap · calibra
        </Link>
      </div>

      <style>{`
        @keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes lp-drift { 0%{transform:translateX(0)} 100%{transform:translateX(32px)} }
      `}</style>
    </div>
  );
}
