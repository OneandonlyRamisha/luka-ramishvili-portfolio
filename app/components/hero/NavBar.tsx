"use client";

import { useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/particleGeometry";
import styles from "./NavBar.module.css";

const NAV_LINKS = [
  { num: "01", label: "ABOUT",        id: "about-section" },
  { num: "02", label: "WORKS",        id: "portfolio-section" },
  { num: "03", label: "TESTIMONIALS", id: "testimonials-section" },
  { num: "04", label: "CONTACT",      id: "contact-section" },
] as const;

interface NavBarProps {
  scrollProgress: number;
}

export default function NavBar({ scrollProgress }: NavBarProps) {
  const navRef    = useRef<HTMLElement>(null);
  const [active, setActive]   = useState<string | null>(null);
  const [pastHero, setPastHero] = useState(false);

  // Clear active when still inside the hero
  useEffect(() => {
    if (scrollProgress < 1) setActive(null);
  }, [scrollProgress]);

  // Detect when about-section enters viewport — that's when we leave the hero
  useEffect(() => {
    const aboutEl = document.getElementById("about-section");
    if (!aboutEl) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPastHero(true);
        } else if (entry.boundingClientRect.top > 0) {
          // Section is below viewport — we haven't reached it yet (scrolled back up)
          setPastHero(false);
        }
        // If top <= 0, we've scrolled past it downward — keep pastHero true
      },
      { threshold: 0 }
    );
    obs.observe(aboutEl);
    return () => obs.disconnect();
  }, []);

  // Text color driven by scrollProgress (dark→light during hero transition)
  // Background only shown once past the hero
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const t = clamp((scrollProgress - 0.48) / 0.22);

    // Text: #0A0A0A → #F5F5F0
    const r = Math.round(10 + (245 - 10) * t);
    const g = Math.round(10 + (245 - 10) * t);
    const b = Math.round(10 + (240 - 10) * t);
    el.style.color = `rgb(${r},${g},${b})`;

    // Background + border only appear after reaching about section
    if (pastHero) {
      el.style.backgroundColor = `rgba(10,10,10,0.78)`;
      el.style.borderBottomColor = `rgba(212,175,55,0.12)`;
    } else {
      el.style.backgroundColor = `transparent`;
      el.style.borderBottomColor = `transparent`;
    }
  }, [scrollProgress, pastHero]);

  // Active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.25 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav ref={navRef} className={styles.nav}>

      {/* ── Logo ──────────────────────────────────────────── */}
      <a href="#" className={styles.logo} onClick={scrollTop} aria-label="Back to top">
        <span className={styles.logoMark}>LR</span>
        <span className={styles.logoDivider} />
        <span className={styles.logoFull}>LUKA RAMISHVILI</span>
      </a>

      {/* ── Links ─────────────────────────────────────────── */}
      <ul className={styles.links}>
        {NAV_LINKS.map(({ num, label, id }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`${styles.link} ${active === id ? styles.linkActive : ""}`}
              onClick={(e) => scrollTo(e, id)}
            >
              <span className={styles.linkNum}>{num}</span>
              <span className={styles.linkLabel}>{label}</span>
              <span className={styles.linkUnderline} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>

    </nav>
  );
}
