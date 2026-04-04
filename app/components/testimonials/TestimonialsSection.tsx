"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./TestimonialsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    quote:
      "Working with him felt like collaborating with someone who understands how brand, mood, and digital presence all have to move as one. For my coffee website, he created something that didn’t just look beautiful — it felt distinct, atmospheric, and deeply aligned with the world I wanted to build. He has a rare ability to turn taste into experience.",
    name: "LUKA JIQIA",
    role: "CO-FOUNDER, MIZANIFLOW",
    avatarInitials: "LJ",
    accentClass: styles.t1,
  },
  {
    quote:
      "Having him design my website was like handing my music to someone who could hear the visual language behind it. Every detail felt deliberate, every choice carried emotion, and the final result reflected me in a way that felt both elevated and honest. He brings an unusual level of sensitivity and precision to his work.",
    name: "SANDRO GEGECHKORI",
    role: "GEORGIAN CONCERT PIANIST",
    avatarInitials: "SG",
    accentClass: styles.t2,
  },
  {
    quote:
      "Working with him was a deeply thoughtful and inspiring process. He approached my website with real care, translating not just my work but my artistic identity into something elegant, expressive, and alive. What he made felt personal and refined — the kind of work that leaves a lasting impression.",
    name: "LIZI RAMISHVILI",
    role: "FOUNDER & CEO, RAMIFORZA",
    avatarInitials: "LR",
    accentClass: styles.t3,
  },
] as const;

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!section || cards.length < 3) return;

    const triggers: ScrollTrigger[] = [];
    const tweens: gsap.core.Tween[] = [];

    // Set transform origin to bottom-center so rotateX tilts the top toward viewer
    gsap.set(cards, { transformOrigin: "50% 100%" });

    // Initial 3D stack positions (GSAP owns all transforms — no CSS transform on these elements)
    gsap.set(cards[0], {
      translateZ: 0,
      scale: 1,
      rotateX: 0,
      y: 0,
      opacity: 1,
    });
    gsap.set(cards[1], {
      translateZ: -60,
      scale: 0.95,
      rotateX: 0,
      y: 0,
      opacity: 1,
    });
    gsap.set(cards[2], {
      translateZ: -120,
      scale: 0.9,
      rotateX: 0,
      y: 0,
      opacity: 1,
    });

    // Left column entrance — fires once as section enters viewport
    tweens.push(
      gsap.from(leftColRef.current, {
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }),
    );

    // Master fall-forward timeline — progress driven 0→1 by ScrollTrigger scrub
    const tl = gsap.timeline({ paused: true });

    // ─── Phase A (0 → 0.5): Card 0 falls, Card 1 advances ───
    tl.addLabel("start");

    tl.to(
      cards[0],
      { rotateX: -20, duration: 0.25, ease: "power2.in" },
      "start",
    );
    tl.to(
      cards[1],
      { translateZ: -20, scale: 0.97, duration: 0.25, ease: "power2.out" },
      "start",
    );

    tl.to(
      cards[0],
      {
        y: "110vh",
        rotateX: -25,
        opacity: 0,
        duration: 0.25,
        ease: "power3.in",
      },
      "start+=0.25",
    );
    tl.to(
      cards[1],
      { translateZ: 0, scale: 1, duration: 0.25, ease: "power2.out" },
      "start+=0.25",
    );
    tl.to(
      cards[2],
      { translateZ: -60, scale: 0.95, duration: 0.25, ease: "power2.out" },
      "start+=0.25",
    );

    tl.addLabel("mid");

    // ─── Phase B (0.5 → 1.0): Card 1 falls, Card 2 advances ───
    tl.to(cards[1], { rotateX: -20, duration: 0.25, ease: "power2.in" }, "mid");

    tl.to(
      cards[1],
      {
        y: "110vh",
        rotateX: -25,
        opacity: 0,
        duration: 0.25,
        ease: "power3.in",
      },
      "mid+=0.25",
    );
    tl.to(
      cards[2],
      { translateZ: 0, scale: 1, duration: 0.25, ease: "power2.out" },
      "mid+=0.25",
    );

    tl.addLabel("end");

    // Bind master timeline to scroll — pin section for 1020vh
    const pinTrigger = ScrollTrigger.create({
      trigger: section,
      pin: true,
      scrub: 1,
      start: "top top",
      end: "+=1020vh",
      animation: tl,
      onUpdate: (self) => {
        const progress = self.progress;
        if (progress < 0.45) setActiveIndex(0);
        else if (progress < 0.9) setActiveIndex(1);
        else setActiveIndex(2);
      },
    });

    triggers.push(pinTrigger);

    return () => {
      triggers.forEach((t) => t.kill());
      tweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="testimonials-section"
      className={styles.section}
    >
      <div className={styles.inner}>
        {/* ── Left column: header, dots, scroll hint ─────────── */}
        <div ref={leftColRef} className={styles.leftCol}>
          <div className={styles.sectionMeta}>
            <span className={styles.metaNum}>03</span>
            <span className={styles.metaLine} />
          </div>

          <h2 className={styles.heading}>
            WHAT DO <br />
            THEY SAY
          </h2>

          <div className={styles.counter} aria-hidden="true">
            {TESTIMONIALS.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ""}`}
              />
            ))}
          </div>

          <div className={styles.scrollHint} aria-hidden="true">
            <span className={styles.scrollHintLine} />
            <span className={styles.scrollHintText}>scroll to read</span>
          </div>
        </div>

        {/* ── Right column: 3D card stage ────────────────────── */}
        <div className={styles.rightCol}>
          <div ref={stageRef} className={styles.stage}>
            <div className={styles.stack}>
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className={`${styles.card} ${t.accentClass}`}
                >
                  {/* cardContent clips interior without touching the 3D-transformed .card */}
                  <div className={styles.cardContent}>
                    <div className={styles.quoteBlock}>
                      <span className={styles.openQuote} aria-hidden="true">
                        ❝
                      </span>
                      <p className={styles.quoteText}>{t.quote}</p>
                      <span className={styles.closeQuote} aria-hidden="true">
                        ❞
                      </span>
                    </div>

                    <div className={styles.attribution}>
                      <div className={styles.avatar} aria-hidden="true">
                        {t.avatarInitials}
                      </div>
                      <div className={styles.identity}>
                        <span className={styles.name}>{t.name}</span>
                        <span className={styles.role}>{t.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
