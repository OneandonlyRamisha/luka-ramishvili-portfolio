"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp } from "@/lib/particleGeometry";
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

  // Fade in — driven by hero scrollProgress (0.70 → 0.87)
  useEffect(() => {
    const bornEl = bornRef.current;
    const createEl = createRef.current;
    if (!bornEl || !createEl) return;

    const fadeT = clamp((scrollProgress - 0.7) / 0.17);
    bornEl.style.opacity = String(fadeT);
    createEl.style.opacity = String(fadeT);
  }, [scrollProgress]);

  // Fade out + backdrop — scrubbed GSAP tweens so mid-page refresh works
  useEffect(() => {
    const aboutEl = document.getElementById("about-section");
    const container = containerRef.current;
    const bd = backdropRef.current;
    if (!aboutEl || !container || !bd) return;

    const tweens: gsap.core.Tween[] = [];
    const triggers: ScrollTrigger[] = [];

    // Backdrop fade in: about section enters viewport
    const bdIn = gsap.fromTo(
      bd,
      { opacity: 0, visibility: "hidden" },
      {
        opacity: 1,
        visibility: "visible",
        immediateRender: false,
        scrollTrigger: {
          trigger: aboutEl,
          start: "top 100%",
          end: "top 80%",
          scrub: true,
        },
      },
    );
    tweens.push(bdIn);
    if (bdIn.scrollTrigger) triggers.push(bdIn.scrollTrigger);

    // Container + backdrop fade out together as about section arrives
    const fadeOut = gsap.to(container, {
      opacity: 0,
      immediateRender: false,
      scrollTrigger: {
        trigger: aboutEl,
        start: "top 80%",
        end: "top 40%",
        scrub: true,
        onLeave: () => {
          container.style.visibility = "hidden";
        },
        onEnterBack: () => {
          container.style.visibility = "visible";
        },
      },
    });
    tweens.push(fadeOut);
    if (fadeOut.scrollTrigger) triggers.push(fadeOut.scrollTrigger);

    const bdOut = gsap.to(bd, {
      opacity: 0,
      immediateRender: false,
      scrollTrigger: {
        trigger: aboutEl,
        start: "top 60%",
        end: "top 20%",
        scrub: true,
        onLeave: () => {
          bd.style.visibility = "hidden";
        },
        onEnterBack: () => {
          bd.style.visibility = "visible";
        },
      },
    });
    tweens.push(bdOut);
    if (bdOut.scrollTrigger) triggers.push(bdOut.scrollTrigger);

    // Catch up to correct state if page loaded mid-scroll
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(rafId);
      triggers.forEach((t) => t.kill());
      tweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, []);

  return (
    <>
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
