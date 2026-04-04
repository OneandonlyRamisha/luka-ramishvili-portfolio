"use client";

import { useRef } from "react";
import { motion, useScroll, useInView } from "framer-motion";
import styles from "./AboutSection.module.css";
import AboutText from "./AboutText";

const MILESTONES = [
  {
    num: "01",
    year: "2019",
    title: "FIRST LINE",
    description:
      "Code met curiosity. A terminal window opened and a new world became possible — one built from logic, rhythm, and pure intent.",
    side: "left" as const,
  },
  {
    num: "02",
    year: "2020",
    title: "THINGS IN MOTION",
    description:
      "Discovered that interfaces breathe. Timing, easing, and choreography became the vocabulary of a craft that never stops moving.",
    side: "right" as const,
  },
  {
    num: "03",
    year: "2023",
    title: "THIRD DIMENSION",
    description:
      "WebGL. Shaders. Particle systems. Geometry became sculpture and the screen became a stage for something completely new.",
    side: "left" as const,
  },
  {
    num: "04",
    year: "2025",
    title: "EXPERIENCE AS STORY",
    description:
      "Scroll became narrative. Every pixel a deliberate beat in a larger composition — cinematic interfaces that feel alive.",
    side: "right" as const,
  },
  {
    num: "05",
    year: "NOW",
    title: "PUSHING BOUNDARIES",
    description:
      "Designer and developer at the intersection of motion, geometry, and storytelling — building digital experiences that leave a mark.",
    side: "left" as const,
    isFinal: true,
  },
] as const;

// Each milestone gets a distinct reveal — never the same twice
const TITLE_ANIMS = [
  // 01 — curtain wipe
  {
    initial: { clipPath: "inset(0 100% 0 0)" },
    animate: { clipPath: "inset(0 0% 0 0)" },
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: 0.18,
    },
  },
  // 02 — slide in from right
  {
    initial: { x: 56, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: {
      duration: 0.95,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: 0.14,
    },
  },
  // 03 — scale + rise
  {
    initial: { y: 28, scale: 0.88, opacity: 0 },
    animate: { y: 0, scale: 1, opacity: 1 },
    transition: {
      duration: 0.9,
      ease: [0.34, 1.56, 0.64, 1] as const,
      delay: 0.1,
    },
  },
  // 04 — skew reveal
  {
    initial: { y: 24, skewX: -5, opacity: 0 },
    animate: { y: 0, skewX: 0, opacity: 1 },
    transition: {
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      delay: 0.14,
    },
  },
  // 05 — dramatic rise
  {
    initial: { y: 44, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: {
      duration: 1.05,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: 0.08,
    },
  },
] as const;

const E = [0.16, 1, 0.3, 1] as const;

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introInView = useInView(introRef, { once: true, margin: "-10% 0px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });

  return (
    <section ref={sectionRef} id="about-section" className={styles.section}>
      {/* ── Intro: marker + animated bio ─────────────────────── */}
      <div className={styles.intro} ref={introRef}>
        <motion.div
          className={styles.markerRow}
          initial={{ opacity: 0, y: -10 }}
          animate={introInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: E }}
          aria-hidden="true"
        >
          <span className={styles.markerNum}>02</span>
          <span className={styles.markerSlash}>/</span>
          <span className={styles.markerLabel}>ABOUT</span>
          <motion.span
            className={styles.markerRuleLine}
            initial={{ scaleX: 0 }}
            animate={introInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.2, ease: E }}
            style={{ transformOrigin: "left center" }}
          />
        </motion.div>

        <div className={styles.bioWrap}>
          <AboutText />
        </div>
      </div>

      {/* ── Timeline ─────────────────────────────────────────── */}
      <div className={styles.timeline}>
        <div className={styles.lineContainer}>
          <div className={styles.lineTrack} />
          <motion.div
            className={styles.lineFill}
            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
          />
        </div>

        {MILESTONES.map((milestone, i) => (
          <MilestoneRow
            key={i}
            milestone={milestone}
            titleAnim={TITLE_ANIMS[i]}
          />
        ))}
      </div>
    </section>
  );
}

type Milestone = (typeof MILESTONES)[number];
type TitleAnim = (typeof TITLE_ANIMS)[number];

function MilestoneRow({
  milestone,
  titleAnim,
}: {
  milestone: Milestone;
  titleAnim: TitleAnim;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, { once: true, margin: "-8% 0px" });
  const isLeft = milestone.side === "left";
  const isFinal = "isFinal" in milestone && milestone.isFinal;

  // Large outlined year for the empty column — the key visual innovation
  const yearDisplay = (
    <motion.div
      className={styles.yearDisplay}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 1.6, ease: E, delay: 0.05 }}
      aria-hidden="true"
    >
      {milestone.year}
    </motion.div>
  );

  const textBlock = (
    <div
      className={`${styles.textBlock} ${isLeft ? styles.alignRight : styles.alignLeft} ${isFinal ? styles.textFinal : ""}`}
    >
      <motion.div
        className={styles.meta}
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0 }}
      >
        <span className={styles.num}>{milestone.num}</span>
        <span className={styles.slash}>/</span>
        <span className={styles.year}>{milestone.year}</span>
      </motion.div>

      <div className={styles.titleWrap}>
        <motion.h3
          className={styles.title}
          initial={titleAnim.initial}
          animate={isInView ? titleAnim.animate : {}}
          transition={titleAnim.transition}
        >
          {milestone.title}
        </motion.h3>
      </div>

      <motion.div
        className={styles.rule}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
        style={{ transformOrigin: isLeft ? "right" : "left" }}
      />

      <motion.p
        className={styles.desc}
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.45,
        }}
      >
        {milestone.description}
      </motion.p>
    </div>
  );

  return (
    <div
      ref={rowRef}
      className={`${styles.row} ${isLeft ? styles.rowLeft : styles.rowRight} ${isFinal ? styles.rowFinal : ""}`}
    >
      {/* Left zone: text when isLeft, large year when isRight */}
      <div className={styles.leftZone}>
        {isLeft && textBlock}
        {!isLeft && yearDisplay}
      </div>

      <div className={styles.nodeZone}>
        <motion.div
          className={styles.node}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.18,
          }}
        >
          <div className={styles.nodeDot} />
          <div className={styles.nodePulse} />
        </motion.div>
      </div>

      {/* Right zone: large year when isLeft, text when isRight */}
      <div className={styles.rightZone}>
        {!isLeft && textBlock}
        {isLeft && yearDisplay}
      </div>
    </div>
  );
}
