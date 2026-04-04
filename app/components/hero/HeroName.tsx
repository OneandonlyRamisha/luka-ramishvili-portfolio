"use client";

import { useEffect, useRef } from "react";
import { clamp, lerpColor } from "@/lib/particleGeometry";
import styles from "./HeroName.module.css";

interface HeroNameProps {
  scrollProgress: number;
}

export default function HeroName({ scrollProgress }: HeroNameProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const p = scrollProgress;

    // Phase 2 (0.4→0.7): gold → warm white
    const colorT = clamp((p - 0.4) / 0.3);
    el.style.color = lerpColor("#B8A88A", "#F5F5F0", colorT);

    // Phase 3 (0.7→0.85): fade out
    const fadeT = clamp((p - 0.7) / 0.15);
    el.style.opacity = String(1 - fadeT);

    // Scale down (0.4→0.85): 1 → 0.08
    const scaleT = clamp((p - 0.4) / 0.45);
    const scale = 1 - scaleT * 0.92;
    el.style.transform = `translateX(-50%) scale(${scale})`;
  }, [scrollProgress]);

  return (
    <div ref={ref} className={styles.name}>
      LUKA RAMISHVILI
    </div>
  );
}
