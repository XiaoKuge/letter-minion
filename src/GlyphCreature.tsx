"use client";

import {
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef } from "react";
import { useGlobalCursor } from "./useGlobalCursor";

export type EyeShape = "round" | "half" | "tall" | "wide";

export interface GlyphCreatureProps {
  /** The single character to render as a creature (letter, digit, or punctuation). */
  char: string;
  /** Cursor position in viewport (client) coords. Defaults to a shared global cursor. */
  cursorX?: MotionValue<number>;
  cursorY?: MotionValue<number>;
  /** Body color of the glyph. */
  color?: string;
  /** Index used to stagger the entrance, vary the blink rhythm, and pick the eye shape. */
  index?: number;
  /** When true, the creature shuts its eyes and holds them closed. */
  eyesClosed?: boolean;
  /** Font used to draw the glyph body. */
  fontFamily?: string;
  /** Tile size in pixels. */
  width?: number;
  height?: number;
}

interface EyeProps {
  cx: number;
  cy: number;
  pupilX: MotionValue<number>;
  pupilY: MotionValue<number>;
  blinkDelay: number;
  closed: boolean;
  /** "round" = circle · "half" = dome · "tall" = vertical ellipse · "wide" = horizontal ellipse. */
  shape: EyeShape;
  /** Draw long eyelashes on the outer corner when closed. */
  lashes: boolean;
  /** Which way is "outer" for the lashes: -1 = left eye, +1 = right eye. */
  side: -1 | 1;
}

/**
 * One eye with two looks that cross-fade:
 *  - OPEN: white sclera (circle / dome / ellipse) + a cursor-tracking pupil, with an idle blink.
 *  - CLOSED: a shape-specific eyelid (concave ‿ / arch ⌒ / horizontal / vertical line),
 *    optionally with long eyelashes fanning from the outer corner.
 */
function Eye({ cx, cy, pupilX, pupilY, blinkDelay, closed, shape, lashes, side }: EyeProps) {
  const isHalf = shape === "half";
  const pcx = useTransform(pupilX, (v) => cx + v * (isHalf ? 0.7 : 1));
  const pcy = useTransform(pupilY, (v) => (isHalf ? cy - 4 : cy) + v * (isHalf ? 0.5 : 1));

  const lid =
    shape === "wide"
      ? `M ${cx - 10} ${cy} L ${cx + 10} ${cy}`
      : shape === "tall"
      ? `M ${cx} ${cy - 12} L ${cx} ${cy + 12}`
      : shape === "half"
      ? `M ${cx - 9} ${cy + 1} Q ${cx} ${cy - 6} ${cx + 9} ${cy + 1}`
      : `M ${cx - 9} ${cy - 1} Q ${cx} ${cy + 6} ${cx + 9} ${cy - 1}`;

  // Lashes anchored to suit each closed shape. (Vertical-line eyes get none.)
  let lashLines: Array<[number, number, number, number]> = [];
  if (lashes && shape !== "tall") {
    if (shape === "wide") {
      const ox = cx + side * 10;
      lashLines = [
        [ox, cy, ox + side * 9, cy - 3],
        [ox, cy, ox + side * 8, cy - 7],
        [ox, cy, ox + side * 4, cy - 9],
      ];
    } else if (shape === "half") {
      const ox = cx + side * 9;
      const oy = cy + 1;
      lashLines = [
        [ox, oy, ox + side * 9, oy + 3],
        [ox, oy, ox + side * 8, oy + 7],
        [ox, oy, ox + side * 4, oy + 10],
      ];
    } else {
      const ox = cx + side * 9;
      const oy = cy - 1;
      lashLines = [
        [ox, oy, ox + side * 9, oy - 3],
        [ox, oy, ox + side * 8, oy - 7],
        [ox, oy, ox + side * 4, oy - 10],
      ];
    }
  }

  return (
    <g>
      {/* OPEN look */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={false}
        animate={closed ? { opacity: 0, scaleY: 0.5 } : { opacity: 1, scaleY: [1, 1, 0.1, 1] }}
        transition={
          closed
            ? { duration: 0.14, ease: "easeOut" }
            : { duration: 0.28, times: [0, 0.9, 0.95, 1], repeat: Infinity, repeatDelay: blinkDelay }
        }
      >
        {shape === "half" ? (
          <path d={`M ${cx - 12} ${cy} A 12 12 0 0 1 ${cx + 12} ${cy} Z`} fill="#ffffff" stroke="#1b2330" strokeWidth={2.5} />
        ) : shape === "tall" ? (
          <ellipse cx={cx} cy={cy} rx={9} ry={13} fill="#ffffff" stroke="#1b2330" strokeWidth={2.5} />
        ) : shape === "wide" ? (
          <ellipse cx={cx} cy={cy} rx={13} ry={8} fill="#ffffff" stroke="#1b2330" strokeWidth={2.5} />
        ) : (
          <circle cx={cx} cy={cy} r={12} fill="#ffffff" stroke="#1b2330" strokeWidth={2.5} />
        )}
        <motion.circle r={isHalf ? 4.2 : 5} fill="#1b2330" style={{ cx: pcx, cy: pcy }} />
      </motion.g>

      {/* CLOSED look */}
      <motion.g initial={false} animate={{ opacity: closed ? 1 : 0 }} transition={{ duration: 0.14, ease: "easeOut" }}>
        <path d={lid} fill="none" stroke="#1b2330" strokeWidth={3} strokeLinecap="round" />
        {lashes && (
          <g stroke="#1b2330" strokeWidth={2} strokeLinecap="round">
            {lashLines.map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
        )}
      </motion.g>
    </g>
  );
}

/**
 * A single character rendered as a googly-eyed "creature". The glyph itself (bold SVG text)
 * is the body, so it works for ANY character with no hand-drawn paths. Two eyes follow the
 * cursor and the head tilts slightly toward it.
 */
export function GlyphCreature({
  char,
  cursorX,
  cursorY,
  color = "#2b6cb0",
  index = 0,
  eyesClosed = false,
  fontFamily = '"Arial Black", "Segoe UI", system-ui, sans-serif',
  width = 84,
  height = 100,
}: GlyphCreatureProps) {
  const global = useGlobalCursor();
  const cx$ = cursorX ?? global.cursorX;
  const cy$ = cursorY ?? global.cursorY;

  const wrapRef = useRef<HTMLDivElement>(null);
  const center = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      center.current = { x: r.left + r.width / 2, y: r.top + r.height * 0.42 };
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, []);

  const angle = useTransform([cx$, cy$], ([cx, cy]) =>
    Math.atan2((cy as number) - center.current.y, (cx as number) - center.current.x)
  );
  const dist = useTransform([cx$, cy$], ([cx, cy]) => {
    const dx = (cx as number) - center.current.x;
    const dy = (cy as number) - center.current.y;
    return Math.min(Math.hypot(dx, dy) / 220, 1);
  });

  const MAX_PUPIL = 3.4;
  const pupilX = useSpring(
    useTransform([angle, dist], ([a, d]) => Math.cos(a as number) * (d as number) * MAX_PUPIL),
    { stiffness: 150, damping: 15 }
  );
  const pupilY = useSpring(
    useTransform([angle, dist], ([a, d]) => Math.sin(a as number) * (d as number) * MAX_PUPIL),
    { stiffness: 150, damping: 15 }
  );

  const tilt = useSpring(
    useTransform([cx$], ([cx]) => {
      const dx = (cx as number) - center.current.x;
      return Math.max(-1, Math.min(1, dx / 300)) * 8;
    }),
    { stiffness: 100, damping: 14 }
  );

  const blinkDelay = 2.4 + (index % 5) * 0.5;
  const eyeShape: EyeShape = (["round", "half", "tall", "wide"] as const)[index % 4];
  const lashes = index % 3 !== 0;

  return (
    <div ref={wrapRef} style={{ width, height }}>
      <motion.svg
        viewBox="0 0 100 120"
        style={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}
        initial={{ opacity: 0, scale: 0.6, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.025 * index }}
      >
        <motion.g style={{ rotate: tilt, transformBox: "fill-box", transformOrigin: "50% 88%" }}>
          <text
            x="50"
            y="64"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={fontFamily}
            fontWeight={900}
            fontSize="92"
            fill={color}
          >
            {char}
          </text>
          <Eye cx={37} cy={46} pupilX={pupilX} pupilY={pupilY} blinkDelay={blinkDelay} closed={eyesClosed} shape={eyeShape} lashes={lashes} side={-1} />
          <Eye cx={63} cy={46} pupilX={pupilX} pupilY={pupilY} blinkDelay={blinkDelay + 0.2} closed={eyesClosed} shape={eyeShape} lashes={lashes} side={1} />
        </motion.g>
      </motion.svg>
    </div>
  );
}
