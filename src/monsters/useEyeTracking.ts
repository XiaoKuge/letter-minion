import { useSpring, useTransform, type MotionValue } from "motion/react";

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
export function useEyeTracking(
  eyeX: number,
  eyeY: number,
  cursorX: MotionValue<number>,
  cursorY: MotionValue<number>,
  options: EyeTrackingOptions | number = {}
) {
  // Support legacy API where 5th param was maxDistance number
  const config: EyeTrackingOptions =
    typeof options === "number"
      ? { maxPupilDistance: options, maxEyeShift: 0 }
      : options;

  const maxPupilDistance = config.maxPupilDistance ?? 6;
  const maxEyeShift = config.maxEyeShift ?? 8;

  // Calculate angle from eye to cursor using atan2
  const angle = useTransform([cursorX, cursorY], ([cx, cy]) => {
    return Math.atan2((cy as number) - eyeY, (cx as number) - eyeX);
  });

  // Calculate normalized distance factor (0 to 1)
  const normalizedDistance = useTransform([cursorX, cursorY], ([cx, cy]) => {
    const dx = (cx as number) - eyeX;
    const dy = (cy as number) - eyeY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Normalize distance - dividing by 100 for good sensitivity
    return Math.min(dist / 100, 1);
  });

  // Eye position offset (the entire eye moves)
  const eyeOffsetX = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.cos(a as number) * (d as number) * maxEyeShift
    ),
    { stiffness: 120, damping: 20 }
  );

  const eyeOffsetY = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.sin(a as number) * (d as number) * maxEyeShift
    ),
    { stiffness: 120, damping: 20 }
  );

  // Pupil position offset (moves within the eye)
  const pupilX = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.cos(a as number) * (d as number) * maxPupilDistance
    ),
    { stiffness: 150, damping: 15 }
  );

  const pupilY = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.sin(a as number) * (d as number) * maxPupilDistance
    ),
    { stiffness: 150, damping: 15 }
  );

  return { eyeOffsetX, eyeOffsetY, pupilX, pupilY };
}

/**
 * Custom hook for tracking cursor and moving the entire face (eyes + mouth)
 * Also provides pupil offset for independent pupil movement within eyes
 * @param faceCenterX - X coordinate of the face center in SVG viewBox
 * @param faceCenterY - Y coordinate of the face center in SVG viewBox
 * @param cursorX - Motion value for cursor X position
 * @param cursorY - Motion value for cursor Y position
 * @param options - Configuration for movement distances
 */
export function useFaceTracking(
  faceCenterX: number,
  faceCenterY: number,
  cursorX: MotionValue<number>,
  cursorY: MotionValue<number>,
  options: FaceTrackingOptions = {}
) {
  const maxFaceShift = options.maxFaceShift ?? 15;
  const maxPupilDistance = options.maxPupilDistance ?? 4;

  // Calculate angle from face center to cursor
  const angle = useTransform([cursorX, cursorY], ([cx, cy]) => {
    return Math.atan2(
      (cy as number) - faceCenterY,
      (cx as number) - faceCenterX
    );
  });

  // Calculate normalized distance factor (0 to 1)
  const normalizedDistance = useTransform([cursorX, cursorY], ([cx, cy]) => {
    const dx = (cx as number) - faceCenterX;
    const dy = (cy as number) - faceCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Normalize distance - dividing by 150 for good sensitivity
    return Math.min(dist / 150, 1);
  });

  // Face position offset (the entire face moves - eyes, mouth, everything)
  const faceOffsetX = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.cos(a as number) * (d as number) * maxFaceShift
    ),
    { stiffness: 100, damping: 20 }
  );

  const faceOffsetY = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.sin(a as number) * (d as number) * maxFaceShift
    ),
    { stiffness: 100, damping: 20 }
  );

  // Pupil position offset (moves within the eye, on top of face movement)
  const pupilOffsetX = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.cos(a as number) * (d as number) * maxPupilDistance
    ),
    { stiffness: 180, damping: 12 }
  );

  const pupilOffsetY = useSpring(
    useTransform(
      [angle, normalizedDistance],
      ([a, d]) => Math.sin(a as number) * (d as number) * maxPupilDistance
    ),
    { stiffness: 180, damping: 12 }
  );

  return { faceOffsetX, faceOffsetY, pupilOffsetX, pupilOffsetY };
}
