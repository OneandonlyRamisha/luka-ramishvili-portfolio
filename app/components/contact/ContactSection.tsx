"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import styles from "./ContactSection.module.css";

const EMAIL = "luka@example.com";
const LINKEDIN_URL = "#"; // replace with real LinkedIn URL
const SOCIALS = [
  {
    label: "LINKEDIN",
    href: "https://www.linkedin.com/in/luka-ramishvili-72550035b",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "INSTAGRAM",
    href: "https://www.instagram.com/luka_ramishvili_",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "FACEBOOK",
    href: "https://www.facebook.com/profile.php?id=61586471017797",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

const MARQUEE = "GET IN TOUCH · LET'S CONNECT · ";
const E = [0.16, 1, 0.3, 1] as const;

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-15% 0px" });
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section ref={sectionRef} id="contact-section" className={styles.section}>
      {/* ── section label ── */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: E, delay: 0.1 }}
      >
        <span className={styles.label}>05 / GET IN TOUCH</span>
        <div className={styles.rule} />
      </motion.header>

      {/* ── main content ── */}
      <div className={styles.content}>
        {/* headline */}
        <div className={styles.headline}>
          <div className={styles.lineClip}>
            <motion.span
              className={styles.line1}
              initial={{ y: "110%" }}
              animate={inView ? { y: "0%" } : {}}
              transition={{ duration: 1, delay: 0.15, ease: E }}
            >
              LET&apos;S
            </motion.span>
          </div>
          <div className={styles.lineClip}>
            <motion.span
              className={styles.line2}
              initial={{ y: "110%" }}
              animate={inView ? { y: "0%" } : {}}
              transition={{ duration: 1, delay: 0.28, ease: E }}
            >
              CONNECT
            </motion.span>
          </div>
        </div>

        {/* socials */}
        <div className={styles.socials}>
          {SOCIALS.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.08, ease: E }}
            >
              <span className={styles.socialIcon}>{s.icon}</span>
              <span className={styles.socialName}>{s.label}</span>
            </motion.a>
          ))}
        </div>
      </div>

      {/* ── infinite arc marquee ── */}
      <div className={styles.arcWrap} aria-hidden="true">
        <svg
          viewBox="0 0 1000 1000"
          className={styles.arcSvg}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path
              id="contactArcPath"
              d="M 500,500 m -420,0 a 420,420 0 1,1 840,0 a 420,420 0 1,1 -840,0"
            />
          </defs>
          <g className={styles.arcSpin}>
            <text className={styles.arcMarqueeText}>
              <textPath href="#contactArcPath" startOffset="0%">
                {MARQUEE.repeat(5)}
              </textPath>
            </text>
          </g>
        </svg>
      </div>
    </section>
  );
}
