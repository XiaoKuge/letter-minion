"use client";
import { motionValue, useTransform, useSpring, motion, useMotionValue } from 'motion/react';
import { useEffect, useRef } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

// src/GlyphCreature.tsx
var cursorX = motionValue(0);
var cursorY = motionValue(0);
var initialized = false;
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
function useGlobalCursor() {
  useEffect(() => {
    init();
  }, []);
  return { cursorX, cursorY };
}
function Eye({ cx, cy, pupilX, pupilY, blinkDelay, closed, shape, lashes, side }) {
  const isHalf = shape === "half";
  const pcx = useTransform(pupilX, (v) => cx + v * (isHalf ? 0.7 : 1));
  const pcy = useTransform(pupilY, (v) => (isHalf ? cy - 4 : cy) + v * (isHalf ? 0.5 : 1));
  const lid = shape === "wide" ? `M ${cx - 10} ${cy} L ${cx + 10} ${cy}` : shape === "tall" ? `M ${cx} ${cy - 12} L ${cx} ${cy + 12}` : shape === "half" ? `M ${cx - 9} ${cy + 1} Q ${cx} ${cy - 6} ${cx + 9} ${cy + 1}` : `M ${cx - 9} ${cy - 1} Q ${cx} ${cy + 6} ${cx + 9} ${cy - 1}`;
  let lashLines = [];
  if (lashes && shape !== "tall") {
    if (shape === "wide") {
      const ox = cx + side * 10;
      lashLines = [
        [ox, cy, ox + side * 9, cy - 3],
        [ox, cy, ox + side * 8, cy - 7],
        [ox, cy, ox + side * 4, cy - 9]
      ];
    } else if (shape === "half") {
      const ox = cx + side * 9;
      const oy = cy + 1;
      lashLines = [
        [ox, oy, ox + side * 9, oy + 3],
        [ox, oy, ox + side * 8, oy + 7],
        [ox, oy, ox + side * 4, oy + 10]
      ];
    } else {
      const ox = cx + side * 9;
      const oy = cy - 1;
      lashLines = [
        [ox, oy, ox + side * 9, oy - 3],
        [ox, oy, ox + side * 8, oy - 7],
        [ox, oy, ox + side * 4, oy - 10]
      ];
    }
  }
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsxs(
      motion.g,
      {
        style: { transformBox: "fill-box", transformOrigin: "center" },
        initial: false,
        animate: closed ? { opacity: 0, scaleY: 0.5 } : { opacity: 1, scaleY: [1, 1, 0.1, 1] },
        transition: closed ? { duration: 0.14, ease: "easeOut" } : { duration: 0.28, times: [0, 0.9, 0.95, 1], repeat: Infinity, repeatDelay: blinkDelay },
        children: [
          shape === "half" ? /* @__PURE__ */ jsx("path", { d: `M ${cx - 12} ${cy} A 12 12 0 0 1 ${cx + 12} ${cy} Z`, fill: "#ffffff", stroke: "#1b2330", strokeWidth: 2.5 }) : shape === "tall" ? /* @__PURE__ */ jsx("ellipse", { cx, cy, rx: 9, ry: 13, fill: "#ffffff", stroke: "#1b2330", strokeWidth: 2.5 }) : shape === "wide" ? /* @__PURE__ */ jsx("ellipse", { cx, cy, rx: 13, ry: 8, fill: "#ffffff", stroke: "#1b2330", strokeWidth: 2.5 }) : /* @__PURE__ */ jsx("circle", { cx, cy, r: 12, fill: "#ffffff", stroke: "#1b2330", strokeWidth: 2.5 }),
          /* @__PURE__ */ jsx(motion.circle, { r: isHalf ? 4.2 : 5, fill: "#1b2330", style: { cx: pcx, cy: pcy } })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(motion.g, { initial: false, animate: { opacity: closed ? 1 : 0 }, transition: { duration: 0.14, ease: "easeOut" }, children: [
      /* @__PURE__ */ jsx("path", { d: lid, fill: "none", stroke: "#1b2330", strokeWidth: 3, strokeLinecap: "round" }),
      lashes && /* @__PURE__ */ jsx("g", { stroke: "#1b2330", strokeWidth: 2, strokeLinecap: "round", children: lashLines.map(([x1, y1, x2, y2], i) => /* @__PURE__ */ jsx("line", { x1, y1, x2, y2 }, i)) })
    ] })
  ] });
}
function GlyphCreature({
  char,
  cursorX: cursorX2,
  cursorY: cursorY2,
  color = "#2b6cb0",
  index = 0,
  eyesClosed = false,
  fontFamily = '"Arial Black", "Segoe UI", system-ui, sans-serif',
  width = 84,
  height = 100
}) {
  const global = useGlobalCursor();
  const cx$ = cursorX2 ?? global.cursorX;
  const cy$ = cursorY2 ?? global.cursorY;
  const wrapRef = useRef(null);
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
  const angle = useTransform(
    [cx$, cy$],
    ([cx, cy]) => Math.atan2(cy - center.current.y, cx - center.current.x)
  );
  const dist = useTransform([cx$, cy$], ([cx, cy]) => {
    const dx = cx - center.current.x;
    const dy = cy - center.current.y;
    return Math.min(Math.hypot(dx, dy) / 220, 1);
  });
  const MAX_PUPIL = 3.4;
  const pupilX = useSpring(
    useTransform([angle, dist], ([a, d]) => Math.cos(a) * d * MAX_PUPIL),
    { stiffness: 150, damping: 15 }
  );
  const pupilY = useSpring(
    useTransform([angle, dist], ([a, d]) => Math.sin(a) * d * MAX_PUPIL),
    { stiffness: 150, damping: 15 }
  );
  const tilt = useSpring(
    useTransform([cx$], ([cx]) => {
      const dx = cx - center.current.x;
      return Math.max(-1, Math.min(1, dx / 300)) * 8;
    }),
    { stiffness: 100, damping: 14 }
  );
  const blinkDelay = 2.4 + index % 5 * 0.5;
  const eyeShape = ["round", "half", "tall", "wide"][index % 4];
  const lashes = index % 3 !== 0;
  return /* @__PURE__ */ jsx("div", { ref: wrapRef, style: { width, height }, children: /* @__PURE__ */ jsx(
    motion.svg,
    {
      viewBox: "0 0 100 120",
      style: { width: "100%", height: "100%", overflow: "visible", display: "block" },
      initial: { opacity: 0, scale: 0.6, y: 10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { type: "spring", stiffness: 260, damping: 18, delay: 0.025 * index },
      children: /* @__PURE__ */ jsxs(motion.g, { style: { rotate: tilt, transformBox: "fill-box", transformOrigin: "50% 88%" }, children: [
        /* @__PURE__ */ jsx(
          "text",
          {
            x: "50",
            y: "64",
            textAnchor: "middle",
            dominantBaseline: "middle",
            fontFamily,
            fontWeight: 900,
            fontSize: "92",
            fill: color,
            children: char
          }
        ),
        /* @__PURE__ */ jsx(Eye, { cx: 37, cy: 46, pupilX, pupilY, blinkDelay, closed: eyesClosed, shape: eyeShape, lashes, side: -1 }),
        /* @__PURE__ */ jsx(Eye, { cx: 63, cy: 46, pupilX, pupilY, blinkDelay: blinkDelay + 0.2, closed: eyesClosed, shape: eyeShape, lashes, side: 1 })
      ] })
    }
  ) });
}
var DEFAULT_COLORS = ["#2b6cb0", "#c2410c", "#15803d", "#7c3aed", "#db2777", "#0891b2", "#ca8a04", "#dc2626"];
function LetterRow({
  text,
  colors = DEFAULT_COLORS,
  gap = 4,
  width = 96,
  height = 120,
  eyesClosed = false,
  fontFamily,
  startIndex = 0,
  style
}) {
  const chars = [...text];
  return /* @__PURE__ */ jsx("div", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", ...style }, children: chars.map((c, i) => {
    const ml = i === 0 ? 0 : gap;
    if (c === " ") {
      return /* @__PURE__ */ jsx("div", { style: { width: Math.max(width * 0.4, 16) }, "aria-hidden": true }, i);
    }
    return /* @__PURE__ */ jsx("div", { style: { marginLeft: ml }, children: /* @__PURE__ */ jsx(
      GlyphCreature,
      {
        char: c,
        index: startIndex + i,
        color: colors[(startIndex + i) % colors.length],
        eyesClosed,
        fontFamily,
        width,
        height
      }
    ) }, i);
  }) });
}
function useEyeTracking(eyeX, eyeY, cursorX2, cursorY2, options = {}) {
  const config = typeof options === "number" ? { maxPupilDistance: options, maxEyeShift: 0 } : options;
  const maxPupilDistance = config.maxPupilDistance ?? 6;
  const maxEyeShift = config.maxEyeShift ?? 8;
  const angle = useTransform([cursorX2, cursorY2], ([cx, cy]) => {
    return Math.atan2(cy - eyeY, cx - eyeX);
  });
  const normalizedDistance = useTransform([cursorX2, cursorY2], ([cx, cy]) => {
    const dx = cx - eyeX;
    const dy = cy - eyeY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.min(dist / 100, 1);
  });
  const eyeOffsetX = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.cos(a) * d * maxEyeShift
    ),
    { stiffness: 120, damping: 20 }
  );
  const eyeOffsetY = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.sin(a) * d * maxEyeShift
    ),
    { stiffness: 120, damping: 20 }
  );
  const pupilX = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.cos(a) * d * maxPupilDistance
    ),
    { stiffness: 150, damping: 15 }
  );
  const pupilY = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.sin(a) * d * maxPupilDistance
    ),
    { stiffness: 150, damping: 15 }
  );
  return { eyeOffsetX, eyeOffsetY, pupilX, pupilY };
}
function useFaceTracking(faceCenterX, faceCenterY, cursorX2, cursorY2, options = {}) {
  const maxFaceShift = options.maxFaceShift ?? 15;
  const maxPupilDistance = options.maxPupilDistance ?? 4;
  const angle = useTransform([cursorX2, cursorY2], ([cx, cy]) => {
    return Math.atan2(
      cy - faceCenterY,
      cx - faceCenterX
    );
  });
  const normalizedDistance = useTransform([cursorX2, cursorY2], ([cx, cy]) => {
    const dx = cx - faceCenterX;
    const dy = cy - faceCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.min(dist / 150, 1);
  });
  const faceOffsetX = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.cos(a) * d * maxFaceShift
    ),
    { stiffness: 100, damping: 20 }
  );
  const faceOffsetY = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.sin(a) * d * maxFaceShift
    ),
    { stiffness: 100, damping: 20 }
  );
  const pupilOffsetX = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.cos(a) * d * maxPupilDistance
    ),
    { stiffness: 180, damping: 12 }
  );
  const pupilOffsetY = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.sin(a) * d * maxPupilDistance
    ),
    { stiffness: 180, damping: 12 }
  );
  return { faceOffsetX, faceOffsetY, pupilOffsetX, pupilOffsetY };
}
function Violetto({
  cursorX: cursorX2,
  cursorY: cursorY2,
  isFormFocused = false,
  isPasswordVisible = false
}) {
  const bodyX = 135;
  const bodyY = 20;
  const bodyWidth = 165;
  const bodyHeight = 340;
  const headHeight = 80;
  const headCenterX = bodyX + bodyWidth / 2;
  const headCenterY = bodyY + headHeight / 2;
  const faceCenterX = headCenterX;
  const faceCenterY = headCenterY;
  const leftEyeOffsetX = -25;
  const rightEyeOffsetX = 25;
  const eyeOffsetY = -8;
  const mouthOffsetY = 20;
  const face = useFaceTracking(faceCenterX, faceCenterY, cursorX2, cursorY2, {
    maxFaceShift: 20,
    maxPupilDistance: 4
  });
  const avertFaceX = useMotionValue(0);
  const avertFaceY = useMotionValue(0);
  const avertPupilX = useMotionValue(0);
  const avertPupilY = useMotionValue(0);
  const smoothAvertFaceX = useSpring(avertFaceX, {
    stiffness: 120,
    damping: 20
  });
  const smoothAvertFaceY = useSpring(avertFaceY, {
    stiffness: 120,
    damping: 20
  });
  const smoothAvertPupilX = useSpring(avertPupilX, {
    stiffness: 120,
    damping: 20
  });
  const smoothAvertPupilY = useSpring(avertPupilY, {
    stiffness: 120,
    damping: 20
  });
  const passwordVisibleFactor = useMotionValue(0);
  const smoothPasswordVisible = useSpring(passwordVisibleFactor, {
    stiffness: 120,
    damping: 20
  });
  useEffect(() => {
    avertFaceX.set(isPasswordVisible ? -15 : 0);
    avertFaceY.set(0);
    avertPupilX.set(isPasswordVisible ? -19 : 0);
    avertPupilY.set(0);
    passwordVisibleFactor.set(isPasswordVisible ? 1 : 0);
  }, [
    isPasswordVisible,
    avertFaceX,
    avertFaceY,
    avertPupilX,
    avertPupilY,
    passwordVisibleFactor
  ]);
  const leanSkewValue = useMotionValue(0);
  const leanSkew = useSpring(leanSkewValue, {
    stiffness: 1e3,
    damping: 50,
    mass: 0.1
  });
  useEffect(() => {
    leanSkewValue.set(isFormFocused && !isPasswordVisible ? -8 : 0);
  }, [isFormFocused, isPasswordVisible, leanSkewValue]);
  const leftPupilTotalX = useTransform(
    [
      face.faceOffsetX,
      face.pupilOffsetX,
      smoothAvertPupilX,
      smoothPasswordVisible
    ],
    ([fx, px, ax, pv]) => {
      const normal = fx + px;
      const avert = ax;
      return normal * (1 - pv) + avert * pv;
    }
  );
  const leftPupilTotalY = useTransform(
    [
      face.faceOffsetY,
      face.pupilOffsetY,
      smoothAvertPupilY,
      smoothPasswordVisible
    ],
    ([fy, py, ay, pv]) => {
      const normal = fy + py;
      const avert = ay;
      return normal * (1 - pv) + avert * pv;
    }
  );
  const rightPupilTotalX = useTransform(
    [
      face.faceOffsetX,
      face.pupilOffsetX,
      smoothAvertPupilX,
      smoothPasswordVisible
    ],
    ([fx, px, ax, pv]) => {
      const normal = fx + px;
      const avert = ax;
      return normal * (1 - pv) + avert * pv;
    }
  );
  const rightPupilTotalY = useTransform(
    [
      face.faceOffsetY,
      face.pupilOffsetY,
      smoothAvertPupilY,
      smoothPasswordVisible
    ],
    ([fy, py, ay, pv]) => {
      const normal = fy + py;
      const avert = ay;
      return normal * (1 - pv) + avert * pv;
    }
  );
  const faceX = useTransform(
    [face.faceOffsetX, smoothAvertFaceX, smoothPasswordVisible],
    ([fx, ax, pv]) => fx * (1 - pv) + ax * pv
  );
  const faceY = useTransform(
    [face.faceOffsetY, smoothAvertFaceY, smoothPasswordVisible],
    ([fy, ay, pv]) => fy * (1 - pv) + ay * pv
  );
  return /* @__PURE__ */ jsx(
    motion.g,
    {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.1 },
      children: /* @__PURE__ */ jsx(
        motion.g,
        {
          style: {
            skewX: leanSkew,
            transformOrigin: "bottom center"
          },
          children: /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx(
              "rect",
              {
                x: bodyX,
                y: bodyY,
                width: bodyWidth,
                height: bodyHeight,
                fill: "#7e27ff",
                rx: 2
              }
            ),
            /* @__PURE__ */ jsx(
              motion.circle,
              {
                r: 8,
                fill: "white",
                style: {
                  x: faceX,
                  y: faceY,
                  translateX: faceCenterX + leftEyeOffsetX,
                  translateY: faceCenterY + eyeOffsetY
                },
                animate: { scaleY: [1, 0.1, 1] },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 0
                }
              }
            ),
            /* @__PURE__ */ jsx(
              motion.circle,
              {
                r: 4,
                fill: "black",
                style: {
                  x: leftPupilTotalX,
                  y: leftPupilTotalY,
                  translateX: faceCenterX + leftEyeOffsetX,
                  translateY: faceCenterY + eyeOffsetY
                },
                animate: { scaleY: [1, 0.1, 1] },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 0
                }
              }
            ),
            /* @__PURE__ */ jsx(
              motion.circle,
              {
                r: 8,
                fill: "white",
                style: {
                  x: faceX,
                  y: faceY,
                  translateX: faceCenterX + rightEyeOffsetX,
                  translateY: faceCenterY + eyeOffsetY
                },
                animate: { scaleY: [1, 0.1, 1] },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 0
                }
              }
            ),
            /* @__PURE__ */ jsx(
              motion.circle,
              {
                r: 4,
                fill: "black",
                style: {
                  x: rightPupilTotalX,
                  y: rightPupilTotalY,
                  translateX: faceCenterX + rightEyeOffsetX,
                  translateY: faceCenterY + eyeOffsetY
                },
                animate: { scaleY: [1, 0.1, 1] },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 0
                }
              }
            ),
            isFormFocused && !isPasswordVisible ? (
              /* Focused: Attentive vertical line mouth */
              /* @__PURE__ */ jsx(
                motion.rect,
                {
                  x: faceCenterX - 1.5,
                  y: faceCenterY + mouthOffsetY - 22,
                  width: 4,
                  height: 28,
                  rx: 1.5,
                  fill: "black",
                  style: {
                    x: faceX,
                    y: faceY
                  }
                }
              )
            ) : (
              /* Default: Small horizontal smile */
              /* @__PURE__ */ jsx(
                motion.path,
                {
                  d: `M ${faceCenterX - 8} ${faceCenterY + mouthOffsetY} Q ${faceCenterX} ${faceCenterY + mouthOffsetY + 4} ${faceCenterX + 8} ${faceCenterY + mouthOffsetY}`,
                  stroke: "black",
                  strokeWidth: 4,
                  strokeLinecap: "round",
                  fill: "none",
                  style: {
                    x: faceX,
                    y: faceY
                  }
                }
              )
            )
          ] })
        }
      )
    }
  );
}
function Inky({
  cursorX: cursorX2,
  cursorY: cursorY2,
  isFormFocused = false,
  isPasswordVisible = false
}) {
  const bodyX = 250;
  const bodyY = 120;
  const bodyWidth = 100;
  const bodyHeight = 240;
  const headHeight = 60;
  const headCenterX = bodyX + bodyWidth / 2;
  const headCenterY = bodyY + headHeight / 2;
  const faceCenterX = headCenterX;
  const faceCenterY = headCenterY;
  const leftEyeOffsetX = -15;
  const rightEyeOffsetX = 15;
  const eyeOffsetY = -5;
  const face = useFaceTracking(faceCenterX, faceCenterY, cursorX2, cursorY2, {
    maxFaceShift: 15,
    maxPupilDistance: 5
  });
  const avertFaceX = useMotionValue(0);
  const avertFaceY = useMotionValue(0);
  const avertPupilX = useMotionValue(0);
  const avertPupilY = useMotionValue(0);
  const smoothAvertFaceX = useSpring(avertFaceX, {
    stiffness: 120,
    damping: 20
  });
  const smoothAvertFaceY = useSpring(avertFaceY, {
    stiffness: 120,
    damping: 20
  });
  const smoothAvertPupilX = useSpring(avertPupilX, {
    stiffness: 120,
    damping: 20
  });
  const smoothAvertPupilY = useSpring(avertPupilY, {
    stiffness: 120,
    damping: 20
  });
  const passwordVisibleFactor = useMotionValue(0);
  const smoothPasswordVisible = useSpring(passwordVisibleFactor, {
    stiffness: 120,
    damping: 20
  });
  useEffect(() => {
    avertFaceX.set(isPasswordVisible ? -12 : 0);
    avertFaceY.set(0);
    avertPupilX.set(isPasswordVisible ? -17 : 0);
    avertPupilY.set(0);
    passwordVisibleFactor.set(isPasswordVisible ? 1 : 0);
  }, [
    isPasswordVisible,
    avertFaceX,
    avertFaceY,
    avertPupilX,
    avertPupilY,
    passwordVisibleFactor
  ]);
  const leanSkewValue = useMotionValue(0);
  const leanSkew = useSpring(leanSkewValue, {
    stiffness: 1e3,
    damping: 50,
    mass: 0.1
  });
  useEffect(() => {
    leanSkewValue.set(isFormFocused && !isPasswordVisible ? -8 : 0);
  }, [isFormFocused, isPasswordVisible, leanSkewValue]);
  const leftPupilTotalX = useTransform(
    [
      face.faceOffsetX,
      face.pupilOffsetX,
      smoothAvertPupilX,
      smoothPasswordVisible
    ],
    ([fx, px, ax, pv]) => {
      const normal = fx + px;
      const avert = ax;
      return normal * (1 - pv) + avert * pv;
    }
  );
  const leftPupilTotalY = useTransform(
    [
      face.faceOffsetY,
      face.pupilOffsetY,
      smoothAvertPupilY,
      smoothPasswordVisible
    ],
    ([fy, py, ay, pv]) => {
      const normal = fy + py;
      const avert = ay;
      return normal * (1 - pv) + avert * pv;
    }
  );
  const rightPupilTotalX = useTransform(
    [
      face.faceOffsetX,
      face.pupilOffsetX,
      smoothAvertPupilX,
      smoothPasswordVisible
    ],
    ([fx, px, ax, pv]) => {
      const normal = fx + px;
      const avert = ax;
      return normal * (1 - pv) + avert * pv;
    }
  );
  const rightPupilTotalY = useTransform(
    [
      face.faceOffsetY,
      face.pupilOffsetY,
      smoothAvertPupilY,
      smoothPasswordVisible
    ],
    ([fy, py, ay, pv]) => {
      const normal = fy + py;
      const avert = ay;
      return normal * (1 - pv) + avert * pv;
    }
  );
  const faceX = useTransform(
    [face.faceOffsetX, smoothAvertFaceX, smoothPasswordVisible],
    ([fx, ax, pv]) => fx * (1 - pv) + ax * pv
  );
  const faceY = useTransform(
    [face.faceOffsetY, smoothAvertFaceY, smoothPasswordVisible],
    ([fy, ay, pv]) => fy * (1 - pv) + ay * pv
  );
  return /* @__PURE__ */ jsx(
    motion.g,
    {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.2 },
      children: /* @__PURE__ */ jsx(
        motion.g,
        {
          style: {
            skewX: leanSkew,
            transformOrigin: "bottom center"
          },
          children: /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx(
              "rect",
              {
                x: bodyX,
                y: bodyY,
                width: bodyWidth,
                height: bodyHeight,
                fill: "#1d2025",
                rx: 2
              }
            ),
            /* @__PURE__ */ jsx(
              motion.circle,
              {
                r: 10,
                fill: "white",
                style: {
                  x: faceX,
                  y: faceY,
                  translateX: faceCenterX + leftEyeOffsetX,
                  translateY: faceCenterY + eyeOffsetY
                },
                animate: { scaleY: [1, 0.1, 1] },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 1
                }
              }
            ),
            /* @__PURE__ */ jsx(
              motion.circle,
              {
                r: 5,
                fill: "black",
                style: {
                  x: leftPupilTotalX,
                  y: leftPupilTotalY,
                  translateX: faceCenterX + leftEyeOffsetX,
                  translateY: faceCenterY + eyeOffsetY
                },
                animate: { scaleY: [1, 0.1, 1] },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 1
                }
              }
            ),
            /* @__PURE__ */ jsx(
              motion.circle,
              {
                r: 10,
                fill: "white",
                style: {
                  x: faceX,
                  y: faceY,
                  translateX: faceCenterX + rightEyeOffsetX,
                  translateY: faceCenterY + eyeOffsetY
                },
                animate: { scaleY: [1, 0.1, 1] },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 1
                }
              }
            ),
            /* @__PURE__ */ jsx(
              motion.circle,
              {
                r: 6,
                fill: "black",
                style: {
                  x: rightPupilTotalX,
                  y: rightPupilTotalY,
                  translateX: faceCenterX + rightEyeOffsetX,
                  translateY: faceCenterY + eyeOffsetY
                },
                animate: { scaleY: [1, 0.1, 1] },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 1
                }
              }
            )
          ] })
        }
      )
    }
  );
}
function Gloop({
  cursorX: cursorX2,
  cursorY: cursorY2,
  isFormFocused = false,
  isPasswordVisible = false
}) {
  const bodyLeft = 60;
  const bodyRight = 260;
  const bodyTop = 230;
  const bodyWidth = bodyRight - bodyLeft;
  const headHeight = 80;
  const headCenterX = bodyLeft + bodyWidth / 2;
  const headCenterY = bodyTop + headHeight / 2;
  const faceCenterX = headCenterX;
  const faceCenterY = headCenterY;
  const leftEyeOffsetX = -25;
  const rightEyeOffsetX = 25;
  const eyeOffsetY = 0;
  const mouthOffsetY = 10;
  const mouthHalfWidth = 11;
  const mouthCurveDepth = 19;
  const face = useFaceTracking(faceCenterX, faceCenterY, cursorX2, cursorY2, {
    maxFaceShift: 15,
    maxPupilDistance: 0
    // No pupils for Gloop
  });
  const avertGazeX = useMotionValue(0);
  const avertGazeY = useMotionValue(0);
  const smoothAvertX = useSpring(avertGazeX, { stiffness: 120, damping: 20 });
  const smoothAvertY = useSpring(avertGazeY, { stiffness: 120, damping: 20 });
  const passwordVisibleFactor = useMotionValue(0);
  const smoothPasswordVisible = useSpring(passwordVisibleFactor, {
    stiffness: 120,
    damping: 20
  });
  useEffect(() => {
    avertGazeX.set(isPasswordVisible ? -15 : 0);
    avertGazeY.set(isPasswordVisible ? 0 : 0);
    passwordVisibleFactor.set(isPasswordVisible ? 1 : 0);
  }, [isPasswordVisible, avertGazeX, avertGazeY, passwordVisibleFactor]);
  const faceX = useTransform(
    [face.faceOffsetX, smoothAvertX, smoothPasswordVisible],
    ([fx, ax, pv]) => fx * (1 - pv) + ax * pv
  );
  const faceY = useTransform(
    [face.faceOffsetY, smoothAvertY, smoothPasswordVisible],
    ([fy, ay, pv]) => fy * (1 - pv) + ay * pv
  );
  const leanSkewValue = useMotionValue(0);
  const leanSkew = useSpring(leanSkewValue, {
    stiffness: 1e3,
    damping: 50,
    mass: 0.1
  });
  useEffect(() => {
    leanSkewValue.set(isFormFocused && !isPasswordVisible ? -3 : 0);
  }, [isFormFocused, isPasswordVisible, leanSkewValue]);
  return /* @__PURE__ */ jsx(
    motion.g,
    {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay: 0.3 },
      children: /* @__PURE__ */ jsx(
        motion.g,
        {
          style: {
            skewX: leanSkew,
            transformOrigin: "bottom center"
          },
          children: /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx(
              "path",
              {
                d: "M 60 360 Q 60 230, 160 230 Q 260 230, 260 360 Z",
                fill: "#ff8a28"
              }
            ),
            isPasswordVisible ? (
              /* Password visible: Curved arch (^ ^) - squinting/closed eye */
              /* @__PURE__ */ jsx(
                motion.path,
                {
                  d: `M ${faceCenterX + leftEyeOffsetX - 8} ${faceCenterY + eyeOffsetY + 3} Q ${faceCenterX + leftEyeOffsetX} ${faceCenterY + eyeOffsetY - 6}, ${faceCenterX + leftEyeOffsetX + 8} ${faceCenterY + eyeOffsetY + 3}`,
                  stroke: "black",
                  strokeWidth: 3,
                  strokeLinecap: "round",
                  fill: "none",
                  style: {
                    x: faceX,
                    y: faceY
                  }
                }
              )
            ) : (
              /* Default: Simple black dot - moves with face */
              /* @__PURE__ */ jsx(
                motion.circle,
                {
                  r: 6,
                  fill: "black",
                  style: {
                    x: faceX,
                    y: faceY,
                    translateX: faceCenterX + leftEyeOffsetX,
                    translateY: faceCenterY + eyeOffsetY
                  },
                  animate: { scaleY: [1, 0.1, 1] },
                  transition: {
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    delay: 0.5
                  }
                }
              )
            ),
            isPasswordVisible ? (
              /* Password visible: Curved arch (^ ^) - squinting/closed eye */
              /* @__PURE__ */ jsx(
                motion.path,
                {
                  d: `M ${faceCenterX + rightEyeOffsetX - 8} ${faceCenterY + eyeOffsetY + 3} Q ${faceCenterX + rightEyeOffsetX} ${faceCenterY + eyeOffsetY - 6}, ${faceCenterX + rightEyeOffsetX + 8} ${faceCenterY + eyeOffsetY + 3}`,
                  stroke: "black",
                  strokeWidth: 3,
                  strokeLinecap: "round",
                  fill: "none",
                  style: {
                    x: faceX,
                    y: faceY
                  }
                }
              )
            ) : (
              /* Default: Simple black dot - moves with face */
              /* @__PURE__ */ jsx(
                motion.circle,
                {
                  r: 6,
                  fill: "black",
                  style: {
                    x: faceX,
                    y: faceY,
                    translateX: faceCenterX + rightEyeOffsetX,
                    translateY: faceCenterY + eyeOffsetY
                  },
                  animate: { scaleY: [1, 0.1, 1] },
                  transition: {
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    delay: 0.5
                  }
                }
              )
            ),
            isPasswordVisible ? (
              /* Password visible: Small open circle shifted to the left */
              /* @__PURE__ */ jsx(
                motion.circle,
                {
                  r: 5,
                  fill: "black",
                  style: {
                    x: faceX,
                    y: faceY,
                    translateX: faceCenterX - 10,
                    translateY: faceCenterY + mouthOffsetY + 5
                  }
                }
              )
            ) : isFormFocused ? (
              /* Focused: Stunned dot mouth (same size as eyes) */
              /* @__PURE__ */ jsx(
                motion.circle,
                {
                  r: 6,
                  fill: "black",
                  style: {
                    x: faceX,
                    y: faceY,
                    translateX: faceCenterX,
                    translateY: faceCenterY + mouthOffsetY + 8
                  }
                }
              )
            ) : (
              /* Default: Filled smile curve */
              /* @__PURE__ */ jsx(
                motion.path,
                {
                  d: `M ${faceCenterX - mouthHalfWidth} ${faceCenterY + mouthOffsetY} Q ${faceCenterX} ${faceCenterY + mouthOffsetY + mouthCurveDepth}, ${faceCenterX + mouthHalfWidth} ${faceCenterY + mouthOffsetY} Z`,
                  fill: "black",
                  style: {
                    x: faceX,
                    y: faceY
                  }
                }
              )
            )
          ] })
        }
      )
    }
  );
}
function Nugget({
  cursorX: cursorX2,
  cursorY: cursorY2,
  isFormFocused = false,
  isPasswordVisible = false
}) {
  const bodyLeft = 320;
  const bodyRight = 420;
  const bodyTop = 230;
  const bodyWidth = bodyRight - bodyLeft;
  const bodyCenterX = bodyLeft + bodyWidth / 2;
  const faceCenterX = bodyCenterX;
  const faceCenterY = bodyTop - 10;
  const avertRotation = useMotionValue(0);
  const smoothAvertRotation = useSpring(avertRotation, {
    stiffness: 100,
    damping: 15
  });
  useEffect(() => {
    avertRotation.set(isPasswordVisible ? -1 : 0);
  }, [isPasswordVisible, avertRotation]);
  const rotationFactor = useSpring(
    useTransform([cursorX2, smoothAvertRotation], ([cx, avert]) => {
      if (isPasswordVisible) return avert;
      const dx = cx - faceCenterX;
      return Math.max(-1, Math.min(1, dx / 150));
    }),
    { stiffness: 100, damping: 15 }
  );
  const verticalFactor = useSpring(
    useTransform(cursorY2, (cy) => {
      const dy = cy - faceCenterY;
      return Math.max(-1, Math.min(1, dy / 150));
    }),
    { stiffness: 100, damping: 15 }
  );
  const leftEyeX = useTransform(rotationFactor, (r) => {
    return faceCenterX - 35 + r * 40;
  });
  const leftEyeVisible = useTransform(leftEyeX, (x) => x > bodyLeft + 10);
  const rightEyeX = useTransform(rotationFactor, (r) => {
    return faceCenterX + 35 + r * 40;
  });
  const rightEyeVisible = useTransform(rightEyeX, (x) => x < bodyRight - 10);
  const eyeY = useTransform(verticalFactor, (v) => {
    return faceCenterY + v * 10;
  });
  const mouthCenterX = useTransform(rotationFactor, (r) => {
    return faceCenterX + r * 30;
  });
  const mouthY = useTransform(verticalFactor, (v) => {
    return faceCenterY + 25 + v * 5;
  });
  const mouthWidth = useTransform(rotationFactor, (r) => {
    return 40 * (1 - Math.abs(r) * 0.3);
  });
  const leanSkewValue = useMotionValue(0);
  const leanSkew = useSpring(leanSkewValue, {
    stiffness: 1e3,
    damping: 50,
    mass: 0.1
  });
  useEffect(() => {
    leanSkewValue.set(isFormFocused && !isPasswordVisible ? -5 : 0);
  }, [isFormFocused, isPasswordVisible, leanSkewValue]);
  return /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx(
    motion.g,
    {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay: 0.4 },
      children: /* @__PURE__ */ jsx(
        motion.g,
        {
          style: {
            skewX: leanSkew,
            transformOrigin: "bottom center"
          },
          children: /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx(
              "path",
              {
                d: "M 320 360 L 320 230 A 50 50 0 0 1 420 230 L 420 360 Z",
                fill: "#f3d300"
              }
            ),
            /* @__PURE__ */ jsx(
              motion.circle,
              {
                r: 4,
                fill: "black",
                style: {
                  cx: leftEyeX,
                  cy: eyeY,
                  opacity: useTransform(leftEyeVisible, (v) => v ? 1 : 0)
                },
                animate: { scaleY: [1, 0.1, 1] },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 1.5
                }
              }
            ),
            /* @__PURE__ */ jsx(
              motion.circle,
              {
                r: 4,
                fill: "black",
                style: {
                  cx: rightEyeX,
                  cy: eyeY,
                  opacity: useTransform(rightEyeVisible, (v) => v ? 1 : 0)
                },
                animate: { scaleY: [1, 0.1, 1] },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 1.5
                }
              }
            ),
            /* @__PURE__ */ jsx(
              motion.line,
              {
                stroke: "black",
                strokeWidth: 4,
                strokeLinecap: "round",
                x1: useTransform(
                  [mouthCenterX, mouthWidth],
                  ([cx, w]) => cx - w
                ),
                x2: useTransform(
                  [mouthCenterX, mouthWidth],
                  ([cx, w]) => cx + w
                ),
                y1: mouthY,
                y2: mouthY
              }
            )
          ] })
        }
      )
    }
  ) });
}
function InteractiveMonsters({
  isFormFocused = false,
  isPasswordVisible = false
}) {
  const containerRef = useRef(null);
  const cursorX2 = useMotionValue(200);
  const cursorY2 = useMotionValue(200);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const svgX = (e.clientX - rect.left) / rect.width * 400;
      const svgY = (e.clientY - rect.top) / rect.height * 400;
      cursorX2.set(svgX);
      cursorY2.set(svgY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX2, cursorY2]);
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      ref: containerRef,
      viewBox: "0 0 400 400",
      style: { width: "100%", height: "100%" },
      "aria-label": "Interactive monster characters",
      children: [
        /* @__PURE__ */ jsx(
          Violetto,
          {
            cursorX: cursorX2,
            cursorY: cursorY2,
            isFormFocused,
            isPasswordVisible
          }
        ),
        /* @__PURE__ */ jsx(
          Inky,
          {
            cursorX: cursorX2,
            cursorY: cursorY2,
            isFormFocused,
            isPasswordVisible
          }
        ),
        /* @__PURE__ */ jsx(
          Gloop,
          {
            cursorX: cursorX2,
            cursorY: cursorY2,
            isFormFocused,
            isPasswordVisible
          }
        ),
        /* @__PURE__ */ jsx(
          Nugget,
          {
            cursorX: cursorX2,
            cursorY: cursorY2,
            isFormFocused,
            isPasswordVisible
          }
        )
      ]
    }
  );
}

export { Gloop, GlyphCreature, Inky, InteractiveMonsters, LetterRow, Nugget, Violetto, useEyeTracking, useFaceTracking, useGlobalCursor };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map