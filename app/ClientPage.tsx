"use client";

import dynamic from "next/dynamic";

const HeroSection = dynamic(
  () => import("./components/hero/HeroSection"),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: "600vh", background: "var(--color-cream)" }} />
    ),
  }
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
  return (
    <>
      <main>
        <HeroSection />
        <AboutSection />
        <PortfolioSection />
        <TestimonialsSection />
        <ContactSection />
      </main>

      <footer style={{
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
          © {new Date().getFullYear()} LUKA RAMISHVILI
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
    </>
  );
}
