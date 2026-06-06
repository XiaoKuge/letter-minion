import * as react from 'react';
import { CSSProperties } from 'react';
import { MotionValue } from 'motion/react';

type EyeShape = "round" | "half" | "tall" | "wide";
interface GlyphCreatureProps {
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
/**
 * A single character rendered as a googly-eyed "creature". The glyph itself (bold SVG text)
 * is the body, so it works for ANY character with no hand-drawn paths. Two eyes follow the
 * cursor and the head tilts slightly toward it.
 */
declare function GlyphCreature({ char, cursorX, cursorY, color, index, eyesClosed, fontFamily, width, height, }: GlyphCreatureProps): react.JSX.Element;

interface LetterRowProps {
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
/**
 * A row of googly-eyed letter creatures spelling `text`. Spaces become gaps.
 * Drop-in: <LetterRow text="QED" />.
 */
declare function LetterRow({ text, colors, gap, width, height, eyesClosed, fontFamily, startIndex, style, }: LetterRowProps): react.JSX.Element;

/**
 * Returns shared cursor MotionValues that any creature can track. Lets you drop a
 * `<GlyphCreature char="A" />` anywhere with no wiring — its eyes follow the cursor.
 */
declare function useGlobalCursor(): {
    cursorX: MotionValue<number>;
    cursorY: MotionValue<number>;
};

interface InteractiveMonstersProps {
    isFormFocused?: boolean;
    isPasswordVisible?: boolean;
}
/**
 * Interactive Monsters Component
 * Renders 4 animated SVG monsters that follow the cursor with their eyes
 * Z-index layering order: Violetto (back) → Inky → Gloop → Nugget (front)
 */
declare function InteractiveMonsters({ isFormFocused, isPasswordVisible, }: InteractiveMonstersProps): react.JSX.Element;

interface ViolettoProps {
    cursorX: MotionValue<number>;
    cursorY: MotionValue<number>;
    isFormFocused?: boolean;
    isPasswordVisible?: boolean;
}
/**
 * Violetto - The Tall Purple One
 * Back left position, tall rectangle shape with wide-set eyes
 */
declare function Violetto({ cursorX, cursorY, isFormFocused, isPasswordVisible, }: ViolettoProps): react.JSX.Element;

interface InkyProps {
    cursorX: MotionValue<number>;
    cursorY: MotionValue<number>;
    isFormFocused?: boolean;
    isPasswordVisible?: boolean;
}
/**
 * Inky - The Dark Shadow
 * Back right position, rectangular pillar with googly eyes that touch
 */
declare function Inky({ cursorX, cursorY, isFormFocused, isPasswordVisible, }: InkyProps): react.JSX.Element;

interface GloopProps {
    cursorX: MotionValue<number>;
    cursorY: MotionValue<number>;
    isFormFocused?: boolean;
    isPasswordVisible?: boolean;
}
/**
 * Gloop - The Big Orange Blob
 * Front left position, large semi-circle/dome shape
 * Simple black dot eyes (no sclera or pupil tracking)
 */
declare function Gloop({ cursorX, cursorY, isFormFocused, isPasswordVisible, }: GloopProps): react.JSX.Element;

interface NuggetProps {
    cursorX: MotionValue<number>;
    cursorY: MotionValue<number>;
    isFormFocused?: boolean;
    isPasswordVisible?: boolean;
}
/**
 * Nugget - The Yellow One
 * Front right position, thumb/gumdrop shaped with a right tilt
 * 3D-like face that rotates based on cursor position
 */
declare function Nugget({ cursorX, cursorY, isFormFocused, isPasswordVisible, }: NuggetProps): react.JSX.Element;

interface EyeTrackingOptions {
    /** Maximum distance pupil can move from center (default: 6) */
    maxPupilDistance?: number;
    /** Maximum distance the entire eye can shift (default: 8) */
    maxEyeShift?: number;
}
interface FaceTrackingOptions {
    /** Maximum distance the entire face can shift (default: 15) */
    maxFaceShift?: number;
    /** Maximum distance pupil can move within the eye (default: 4) */
    maxPupilDistance?: number;
}
/**
 * Custom hook for tracking cursor position and calculating both eye and pupil movement
 * The entire eye moves towards the cursor, and the pupil moves within the eye
 * @param eyeX - X coordinate of the eye center in SVG viewBox
 * @param eyeY - Y coordinate of the eye center in SVG viewBox
 * @param cursorX - Motion value for cursor X position
 * @param cursorY - Motion value for cursor Y position
 * @param options - Configuration for movement distances
 * @returns Object with eyeX, eyeY (eye position offset) and pupilX, pupilY (pupil offset within eye)
 */
declare function useEyeTracking(eyeX: number, eyeY: number, cursorX: MotionValue<number>, cursorY: MotionValue<number>, options?: EyeTrackingOptions | number): {
    eyeOffsetX: MotionValue<number>;
    eyeOffsetY: MotionValue<number>;
    pupilX: MotionValue<number>;
    pupilY: MotionValue<number>;
};
/**
 * Custom hook for tracking cursor and moving the entire face (eyes + mouth)
 * Also provides pupil offset for independent pupil movement within eyes
 * @param faceCenterX - X coordinate of the face center in SVG viewBox
 * @param faceCenterY - Y coordinate of the face center in SVG viewBox
 * @param cursorX - Motion value for cursor X position
 * @param cursorY - Motion value for cursor Y position
 * @param options - Configuration for movement distances
 */
declare function useFaceTracking(faceCenterX: number, faceCenterY: number, cursorX: MotionValue<number>, cursorY: MotionValue<number>, options?: FaceTrackingOptions): {
    faceOffsetX: MotionValue<number>;
    faceOffsetY: MotionValue<number>;
    pupilOffsetX: MotionValue<number>;
    pupilOffsetY: MotionValue<number>;
};

export { type EyeShape, Gloop, GlyphCreature, type GlyphCreatureProps, Inky, InteractiveMonsters, LetterRow, type LetterRowProps, Nugget, Violetto, useEyeTracking, useFaceTracking, useGlobalCursor };
