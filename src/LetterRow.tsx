"use client";

import type { CSSProperties } from "react";
import { GlyphCreature } from "./GlyphCreature";

export interface LetterRowProps {
  /** The string to spell out, one creature per character. */
  text: string;
  /** Colors cycled across the letters. */
  colors?: string[];
  /** Horizontal spacing between letters in px (negative values tuck them closer). */
  gap?: number;
  /** Per-letter tile size in px. */
  width?: number;
  height?: number;
  /** Shut every letter's eyes. */
  eyesClosed?: boolean;
  /** Font used for the glyph bodies. */
  fontFamily?: string;
  /** Offset added to each letter's index (affects eye-shape/blink variety). */
  startIndex?: number;
  style?: CSSProperties;
}

const DEFAULT_COLORS = ["#2b6cb0", "#c2410c", "#15803d", "#7c3aed", "#db2777", "#0891b2", "#ca8a04", "#dc2626"];

/**
 * A row of googly-eyed letter creatures spelling `text`. Spaces become gaps.
 * Drop-in: <LetterRow text="QED" />.
 */
export function LetterRow({
  text,
  colors = DEFAULT_COLORS,
  gap = 4,
  width = 96,
  height = 120,
  eyesClosed = false,
  fontFamily,
  startIndex = 0,
  style,
}: LetterRowProps) {
  const chars = [...text];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", ...style }}>
      {chars.map((c, i) => {
        const ml = i === 0 ? 0 : gap;
        if (c === " ") {
          return <div key={i} style={{ width: Math.max(width * 0.4, 16) }} aria-hidden />;
        }
        return (
          <div key={i} style={{ marginLeft: ml }}>
            <GlyphCreature
              char={c}
              index={startIndex + i}
              color={colors[(startIndex + i) % colors.length]}
              eyesClosed={eyesClosed}
              fontFamily={fontFamily}
              width={width}
              height={height}
            />
          </div>
        );
      })}
    </div>
  );
}
