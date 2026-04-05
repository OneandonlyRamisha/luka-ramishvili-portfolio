"use client";

import { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
  ready: boolean;
  onDone: () => void;
}

export default function LoadingScreen({ ready, onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  // Simulated progress that accelerates when truly ready
  useEffect(() => {
    let raf: number;
    let current = 0;

    const tick = () => {
      if (ready) {
        // Rush to 100
        current += (100 - current) * 0.12;
      } else {
        // Slow crawl to ~85
        current += (85 - current) * 0.008;
      }

      if (current > 99.5) {
        current = 100;
        setProgress(100);
        return;
      }

      setProgress(current);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  // When progress hits 100, trigger exit animation then unmount
  useEffect(() => {
    if (progress < 100) return;

    const t1 = setTimeout(() => setExiting(true), 200);
    const t2 = setTimeout(() => onDone(), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [progress, onDone]);

  return (
    <div className={`${styles.overlay} ${exiting ? styles.exit : ""}`}>
      <div className={styles.content}>
        <span className={styles.name}>LUKA RAMISHVILI</span>

        <div className={styles.barTrack}>
          <div
            className={styles.barFill}
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </div>

        <span className={styles.percent}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
