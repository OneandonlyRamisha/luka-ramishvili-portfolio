"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import ErrorBoundary from "./ErrorBoundary";
import LoadingScreen from "./LoadingScreen";

const HeroSection = dynamic(
  () => import("./components/hero/HeroSection"),
  { ssr: false }
);

const AboutSection = dynamic(
  () => import("./components/about/AboutSection"),
  { ssr: false }
);

const PortfolioSection = dynamic(
  () => import("./components/portfolio/PortfolioSection"),
  { ssr: false }
);

const TestimonialsSection = dynamic(
  () => import("./components/testimonials/TestimonialsSection"),
  { ssr: false }
);

const ContactSection = dynamic(
  () => import("./components/contact/ContactSection"),
  { ssr: false }
);

export default function ClientPage() {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const loadedRef = useRef(new Set<string>());

  const markLoaded = useCallback((name: string) => {
    loadedRef.current.add(name);
    if (loadedRef.current.size >= 5) {
      setReady(true);
    }
  }, []);

  // Fallback: force ready after 8s no matter what
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 8000);
    return () => clearTimeout(id);
  }, []);

  return (
    <ErrorBoundary>
      {!dismissed && (
        <LoadingScreen ready={ready} onDone={() => setDismissed(true)} />
      )}

      <main style={{ visibility: dismissed ? "visible" : "hidden" }}>
        <HeroSection onReady={() => markLoaded("hero")} />
        <AboutSection onReady={() => markLoaded("about")} />
        <PortfolioSection onReady={() => markLoaded("portfolio")} />
        <TestimonialsSection onReady={() => markLoaded("testimonials")} />
        <ContactSection onReady={() => markLoaded("contact")} />
      </main>

      <footer style={{
        visibility: dismissed ? "visible" : "hidden",
        background: "var(--color-dark)",
        borderTop: "1px solid rgba(212, 175, 55, 0.1)",
        padding: "2rem clamp(1.25rem, 4vw, 3rem)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(0.45rem, 1.2vw, 0.6rem)",
          letterSpacing: "0.25em",
          color: "rgba(245, 245, 240, 0.3)",
        }}>
          &copy; {new Date().getFullYear()} LUKA RAMISHVILI
        </span>

        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(0.45rem, 1.2vw, 0.6rem)",
          letterSpacing: "0.25em",
          color: "rgba(212, 175, 55, 0.25)",
        }}>
          ALL RIGHTS RESERVED
        </span>
      </footer>
    </ErrorBoundary>
  );
}
