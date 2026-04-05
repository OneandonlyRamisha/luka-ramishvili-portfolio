"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import NavBar from "./NavBar";
import ParticleSphere from "./ParticleSphere";
import HeroName from "./HeroName";
import BornToCreate from "./BornToCreate";
import styles from "./HeroSection.module.css";

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onReady?: () => void;
}

export default function HeroSection({ onReady }: HeroSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => { onReady?.(); }, [onReady]);

  const handleProgress = useCallback((p: number) => {
    setScrollProgress(p);
  }, []);

  useScrollProgress(scrollRef, handleProgress);

  // GSAP background color tween (no React re-renders)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const tween = gsap.to(document.body, {
      backgroundColor: "#0A0A0A",
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "35% top",
        end: "62% top",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
    };
  }, []);

  return (
    <div ref={scrollRef} className={styles.outer}>
      <NavBar scrollProgress={scrollProgress} />
      <div className={styles.sticky}>
        <ParticleSphere scrollProgress={scrollProgress} />
        <HeroName scrollProgress={scrollProgress} />
      </div>
      {/* BornToCreate is position:fixed — must live outside overflow:hidden sticky */}
      <BornToCreate scrollProgress={scrollProgress} />
    </div>
  );
}
