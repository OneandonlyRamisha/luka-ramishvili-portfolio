"use client";

import { useEffect, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress(
  triggerRef: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void
) {
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => onProgress(self.progress),
    });

    return () => {
      trigger.kill();
    };
  }, [triggerRef, onProgress]);
}
