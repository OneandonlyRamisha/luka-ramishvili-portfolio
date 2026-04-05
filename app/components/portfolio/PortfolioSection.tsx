"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import styles from "./PortfolioSection.module.css";
import PortfolioParticles from "./PortfolioParticles";

gsap.registerPlugin(ScrollTrigger);

/* ───────── project data ───────── */
const PROJECTS = [
  {
    image: "/projects/one.png",
    title: "FLOW COFFEE",
    category: "Stunning scroll animation website",
    website: "https://drinkflow.coffee/",
    github: "https://github.com/OneandonlyRamisha/mizani-flow",
  },
  {
    image: "/projects/two.png",
    title: "UNTIL I CAN TEACH IT",
    category: "Full-stack blg website about philosophy",
    website: "https://until-i-can-teach-it.vercel.app/",
    github: "https://github.com/OneandonlyRamisha/until-i-can-teach-it",
  },
  {
    image: "/projects/three.png",
    title: "DEAR FENCING",
    category: "Website that tells story of fencing",
    website: "https://dear-fencing.vercel.app/",
    github: "https://github.com/OneandonlyRamisha/dear-fencing",
  },
  {
    image: "/projects/four.png",
    title: "SANDRO GEGECHKORI",
    category: "Full-stack website for Georgian pianist",
    website: "https://sandrogegechkoriofficial.com/",
    github: "https://github.com/OneandonlyRamisha/sandro-gegechkori",
  },
  {
    image: "/projects/five.png",
    title: "LIZI RAMISHVILI",
    category: "Beautiful full-stack website for prominent Georgian cellist",
    website: "https://www.liziramishvili.com/",
    github: "https://github.com/OneandonlyRamisha/lizi-ramishvili-v2",
  },
];

const CIRCUMFERENCE = 2 * Math.PI * 24;

interface PortfolioSectionProps {
  onReady?: () => void;
}

export default function PortfolioSection({ onReady }: PortfolioSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);

  useEffect(() => { onReady?.(); }, [onReady]);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const currentFloatRef = useRef(0);
  const rafRef = useRef(0);
  const [active, setActive] = useState(0);

  /* ── GSAP scroll pin ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const triggers: ScrollTrigger[] = [];

    triggers.push(
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=500vh",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const idx = Math.round(self.progress * (PROJECTS.length - 1));
          setActive(Math.min(idx, PROJECTS.length - 1));
        },
        onEnter: () => {
          document.querySelector("nav")?.classList.add("nav-hidden");
        },
        onLeave: () => {
          document.querySelector("nav")?.classList.remove("nav-hidden");
        },
        onEnterBack: () => {
          document.querySelector("nav")?.classList.add("nav-hidden");
        },
        onLeaveBack: () => {
          document.querySelector("nav")?.classList.remove("nav-hidden");
        },
      }),
    );

    return () => {
      triggers.forEach((t) => t.kill());
      document.querySelector("nav")?.classList.remove("nav-hidden");
    };
  }, []);

  /* ── RAF slide animation (direct DOM, no setState) ── */
  useEffect(() => {
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      const target = progressRef.current * (PROJECTS.length - 1);
      currentFloatRef.current += (target - currentFloatRef.current) * 0.07;
      const cf = currentFloatRef.current;

      for (let i = 0; i < PROJECTS.length; i++) {
        const el = slidesRef.current[i];
        if (!el) continue;

        const offset = cf - i;
        const absOffset = Math.abs(offset);

        if (absOffset > 1.5) {
          el.style.visibility = "hidden";
          continue;
        }

        el.style.visibility = "visible";
        const tx = offset * -108;
        const ry = offset * 4;
        const sc = 1 - absOffset * 0.045;
        const op = Math.max(0, 1 - absOffset * 0.75);
        const zi = 10 - Math.round(absOffset * 5);

        el.style.transform = `translateX(${tx}%) rotateY(${ry}deg) scale(${sc})`;
        el.style.opacity = String(op);
        el.style.zIndex = String(zi);
      }
    };
    animate();

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const project = PROJECTS[active];
  const progress = (active + 1) / PROJECTS.length;

  return (
    <section ref={sectionRef} id="portfolio-section" className={styles.section}>
      {/* ── image slides ── */}
      <div className={styles.imageArea}>
        {PROJECTS.map((p, i) => (
          <div
            key={i}
            ref={(el) => {
              slidesRef.current[i] = el;
            }}
            className={styles.slide}
          >
            <Image
              src={p.image}
              alt={p.title}
              fill
              className={styles.slideImage}
              sizes="100vw"
              priority={i < 2}
            />
          </div>
        ))}
      </div>

      {/* ── particle atmosphere (Three.js) ── */}
      <div className={styles.particles}>
        <PortfolioParticles />
      </div>

      {/* ── vignette ── */}
      <div className={styles.vignette} />

      {/* ── circular counter (top-left) ── */}
      <div className={styles.counter}>
        <svg viewBox="0 0 60 60" className={styles.ring}>
          <circle
            cx="30"
            cy="30"
            r="24"
            fill="none"
            stroke="rgba(212,175,55,0.1)"
            strokeWidth="1.5"
          />
          <circle
            cx="30"
            cy="30"
            r="24"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            strokeLinecap="round"
            className={styles.ringProgress}
          />
        </svg>
        <div className={styles.counterInner}>
          <span className={styles.counterNum} key={`n-${active}`}>
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className={styles.counterSlash}>/</span>
          <span className={styles.counterTotal}>
            {String(PROJECTS.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── section label (top-right) ── */}
      <span className={styles.sectionLabel}>SELECTED WORK</span>

      {/* ── bottom bar ── */}
      <div className={styles.bottomBar}>
        <div className={styles.info}>
          <h2 className={styles.title} key={active}>
            {project.title}
          </h2>
          <span className={styles.category} key={`cat-${active}`}>
            {project.category}
          </span>
        </div>

        <div className={styles.actions}>
          <a
            href={project.website}
            className={styles.primaryBtn}
            target="_blank"
          >
            Visit Website&nbsp;&rarr;
          </a>
          <a
            href={project.github}
            className={styles.secondaryBtn}
            target="_blank"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>

      {/* ── progress dots ── */}
      <div className={styles.dots}>
        {PROJECTS.map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
          />
        ))}
      </div>
    </section>
  );
}
