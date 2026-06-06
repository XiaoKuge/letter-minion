"use client";

import { useEffect } from "react";
import { motionValue, type MotionValue } from "motion/react";

// Shared, app-wide cursor position in viewport coordinates. Created once; a single
// mousemove listener is attached lazily on first client use.
const cursorX: MotionValue<number> = motionValue(0);
const cursorY: MotionValue<number> = motionValue(0);
let initialized = false;

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  cursorX.set(window.innerWidth / 2);
  cursorY.set(window.innerHeight / 2);
  window.addEventListener("mousemove", (e) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
  });
}

/**
 * Returns shared cursor MotionValues that any creature can track. Lets you drop a
 * `<GlyphCreature char="A" />` anywhere with no wiring — its eyes follow the cursor.
 */
export function useGlobalCursor(): { cursorX: MotionValue<number>; cursorY: MotionValue<number> } {
  useEffect(() => {
    init();
  }, []);
  return { cursorX, cursorY };
}
