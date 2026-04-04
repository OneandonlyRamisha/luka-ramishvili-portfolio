"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp, lerpColor } from "@/lib/particleGeometry";
import styles from "./BornToCreate.module.css";

gsap.registerPlugin(ScrollTrigger);

interface BornToCreateProps {
  scrollProgress: number;
}

export default function BornToCreate({ scrollProgress }: BornToCreateProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bornRef = useRef<HTMLSpanElement>(null);
  const createRef = useRef<HTMLSpanElement>(null);
  const splitTargetRef = useRef<{ born: number; create: number } | null>(null);

  // Measure split targets on mount + resize
  useEffect(() => {
    const measure = () => {
      const bornEl = bornRef.current;
      const createEl = createRef.current;
      if (!bornEl || !createEl) return;
      const vw = window.innerWidth;
      const pad = Math.round(vw * 0.04);
      const bornRect = bornEl.getBoundingClientRect();
      const createRect = createEl.getBoundingClientRect();
      splitTargetRef.current = {
        born: pad - bornRect.left,
        create: vw - pad - createRect.right,
      };
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Fade in only — driven by hero scrollProgress (0.70 → 0.87).
  // No split here — words stay centered through the end of the hero.
  useEffect(() => {
    const bornEl = bornRef.current;
    const createEl = createRef.current;
    if (!bornEl || !createEl) return;

    const fadeT = clamp((scrollProgress - 0.7) / 0.17);
    bornEl.style.opacity = String(fadeT);
    createEl.style.opacity = String(fadeT);
  }, [scrollProgress]);

  useEffect(() => {
    const aboutEl = document.getElementById("about-section");
    if (!aboutEl) return;

    const triggers: ScrollTrigger[] = [];

    // ── Phase 1: backdrop builds, words stay still ───────────
    // About section enters the viewport. Backdrop fades in to
    // confirm the black background. Words do nothing yet.
    triggers.push(
      ScrollTrigger.create({
        trigger: aboutEl,
        start: "top 100%",
        end: "top 90%",
        scrub: 1,
        onEnter: () => {
          const bd = backdropRef.current;
          if (bd) {
            bd.style.opacity = "1";
            bd.style.visibility = "visible";
          }
        },
        onLeaveBack: () => {
          const bd = backdropRef.current;
          if (bd) {
            bd.style.opacity = "0";
            bd.style.visibility = "hidden";
          }
        },
        onEnterBack: () => {
          const container = containerRef.current;
          const bornEl = bornRef.current;
          const createEl = createRef.current;
          if (container) {
            container.style.visibility = "visible";
            container.style.opacity = "1";
            container.style.transform = "translateY(-50%)";
          }
          if (bornEl) {
            bornEl.style.transform = "";
            bornEl.style.opacity = "1";
          }
          if (createEl) {
            createEl.style.transform = "";
            createEl.style.color = "";
          }
          const bd = backdropRef.current;
          if (bd) {
            bd.style.opacity = "1";
            bd.style.visibility = "visible";
          }
        },
      }),
    );

    // ── Phase 2: words split — backdrop stays opaque ─────────
    // Background is confirmed black. "BORN TO" flies left,
    // "CREATE" flies right. The backdrop stays fully opaque so
    // About section content is hidden while the split plays out.
    triggers.push(
      ScrollTrigger.create({
        trigger: aboutEl,
        start: "top 90%",
        end: "top 50%",
        scrub: 1,
        onUpdate: (self) => {
          const t = self.progress;
          const bornEl = bornRef.current;
          const createEl = createRef.current;
          const targets = splitTargetRef.current;
          if (!bornEl || !createEl || !targets) return;

          bornEl.style.transform = `translateX(${targets.born * t}px)`;
          createEl.style.transform = `translateX(${targets.create * t}px)`;
          createEl.style.color = lerpColor("#F5F5F0", "#D4AF37", t);
          // Backdrop stays at 1 — About content hidden during split
        },
        onEnterBack: () => {
          const bd = backdropRef.current;
          if (bd) {
            bd.style.opacity = "1";
            bd.style.visibility = "visible";
          }
        },
      }),
    );

    // ── Phase 3: backdrop drops to reveal About content ───────
    // Split is complete. The backdrop fades away, unveiling the
    // About section. Words (now at edges) fade out as well.
    triggers.push(
      ScrollTrigger.create({
        trigger: aboutEl,
        start: "top 50%",
        end: "top 5%",
        scrub: 1,
        onUpdate: (self) => {
          const t = self.progress;
          const bd = backdropRef.current;
          const container = containerRef.current;

          // Words vanish first — fully gone before backdrop reveals anything
          if (container)
            container.style.opacity = String(Math.max(0, 1 - t * 4));

          // Backdrop drops after words are already gone
          if (bd) bd.style.opacity = String(Math.max(0, 1 - t));
        },
        onLeave: () => {
          const container = containerRef.current;
          const bd = backdropRef.current;
          if (container) {
            container.style.opacity = "0";
            container.style.visibility = "hidden";
          }
          if (bd) {
            bd.style.opacity = "0";
            bd.style.visibility = "hidden";
          }
        },
        onEnterBack: () => {
          const container = containerRef.current;
          const bd = backdropRef.current;
          if (container) container.style.visibility = "visible";
          if (bd) {
            bd.style.visibility = "visible";
            bd.style.opacity = "1";
          }
        },
      }),
    );

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <>
      {/* Dark backdrop — hides About section during the split */}
      <div ref={backdropRef} className={styles.backdrop} />
      <div ref={containerRef} className={styles.container}>
        <span ref={bornRef} className={styles.word}>
          BORN TO&nbsp;
        </span>
        <span ref={createRef} className={styles.word}>
          CREATE
        </span>
      </div>
    </>
  );
}
