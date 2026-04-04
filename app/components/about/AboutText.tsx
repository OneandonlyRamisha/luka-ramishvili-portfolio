"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./AboutText.module.css";

const BIO =
  "UX/UI Designer, full-stack web & app developer pushing the boundaries of digital experience. I build cinematic interfaces where motion, geometry, and storytelling converge into something that feels alive.";

export default function AboutText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const words = BIO.split(" ");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.25"],
  });

  return (
    <div ref={containerRef} className={styles.container}>
      <p className={styles.text}>
        {words.map((word, i) => {
          const start = i / words.length;
          const end = (i + 1) / words.length;
          return (
            <WordSpan
              key={i}
              word={word}
              progress={scrollYProgress}
              start={start}
              end={end}
            />
          );
        })}
      </p>
    </div>
  );
}

function WordSpan({
  word,
  progress,
  start,
  end,
}: {
  word: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0.15, 1]);
  const color = useTransform(progress, [start, end], ["#4a4540", "#F5F5F0"]);

  return (
    <motion.span style={{ opacity, color }} className={styles.word}>
      {word}{" "}
    </motion.span>
  );
}
