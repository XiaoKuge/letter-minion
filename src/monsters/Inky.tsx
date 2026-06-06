import {
  motion,
  useTransform,
  useSpring,
  useMotionValue,
  type MotionValue,
} from "motion/react";
import { useEffect } from "react";
import { useFaceTracking } from "./useEyeTracking";

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
export function Inky({
  cursorX,
  cursorY,
  isFormFocused = false,
  isPasswordVisible = false,
}: InkyProps) {
  // Body dimensions
  const bodyX = 250;
  const bodyY = 120;
  const bodyWidth = 100;
  const bodyHeight = 240;

  // Head region (top portion of body)
  const headHeight = 60;
  const headCenterX = bodyX + bodyWidth / 2; // 300
  const headCenterY = bodyY + headHeight / 2; // 150 (center of head area)

  // Face center starts at head center
  const faceCenterX = headCenterX;
  const faceCenterY = headCenterY;

  // Eye positions relative to face center (googly style, close together)
  const leftEyeOffsetX = -15;
  const rightEyeOffsetX = 15;
  const eyeOffsetY = -5;

  // Face tracking - entire face moves together, pupils move independently
  const face = useFaceTracking(faceCenterX, faceCenterY, cursorX, cursorY, {
    maxFaceShift: 15,
    maxPupilDistance: 5,
  });

  // Averting gaze state - eyes look left when password is visible
  // Face/sclera moves left, pupil moves even further left to be at edge of eye
  const avertFaceX = useMotionValue(0);
  const avertFaceY = useMotionValue(0);
  const avertPupilX = useMotionValue(0);
  const avertPupilY = useMotionValue(0);
  const smoothAvertFaceX = useSpring(avertFaceX, {
    stiffness: 120,
    damping: 20,
  });
  const smoothAvertFaceY = useSpring(avertFaceY, {
    stiffness: 120,
    damping: 20,
  });
  const smoothAvertPupilX = useSpring(avertPupilX, {
    stiffness: 120,
    damping: 20,
  });
  const smoothAvertPupilY = useSpring(avertPupilY, {
    stiffness: 120,
    damping: 20,
  });

  // Password visible as MotionValue for reactive transforms
  const passwordVisibleFactor = useMotionValue(0);
  const smoothPasswordVisible = useSpring(passwordVisibleFactor, {
    stiffness: 120,
    damping: 20,
  });

  useEffect(() => {
    // When password visible, face moves left, pupil moves further left (to edge of sclera)
    // Sclera radius is 10, pupil radius is 5-6, so pupil can move ~4-5px within eye
    avertFaceX.set(isPasswordVisible ? -12 : 0);
    avertFaceY.set(0);
    avertPupilX.set(isPasswordVisible ? -17 : 0); // -12 face + -5 pupil offset
    avertPupilY.set(0);
    passwordVisibleFactor.set(isPasswordVisible ? 1 : 0);
  }, [
    isPasswordVisible,
    avertFaceX,
    avertFaceY,
    avertPupilX,
    avertPupilY,
    passwordVisibleFactor,
  ]);

  // Lean animation when form is focused - use skewX to keep base flat
  // Disabled when password is visible (averting gaze)
  const leanSkewValue = useMotionValue(0);
  const leanSkew = useSpring(leanSkewValue, {
    stiffness: 1000,
    damping: 50,
    mass: 0.1,
  });

  useEffect(() => {
    // Negative skewX leans the top to the right while keeping bottom flat
    // Don't lean when password is visible (averting gaze)
    leanSkewValue.set(isFormFocused && !isPasswordVisible ? -8 : 0);
  }, [isFormFocused, isPasswordVisible, leanSkewValue]);

  // Combine face offset with pupil offset for total pupil position
  // Interpolate between normal tracking and avert gaze based on password visibility
  const leftPupilTotalX = useTransform(
    [
      face.faceOffsetX,
      face.pupilOffsetX,
      smoothAvertPupilX,
      smoothPasswordVisible,
    ],
    ([fx, px, ax, pv]) => {
      const normal = (fx as number) + (px as number);
      const avert = ax as number;
      return normal * (1 - (pv as number)) + avert * (pv as number);
    }
  );
  const leftPupilTotalY = useTransform(
    [
      face.faceOffsetY,
      face.pupilOffsetY,
      smoothAvertPupilY,
      smoothPasswordVisible,
    ],
    ([fy, py, ay, pv]) => {
      const normal = (fy as number) + (py as number);
      const avert = ay as number;
      return normal * (1 - (pv as number)) + avert * (pv as number);
    }
  );
  const rightPupilTotalX = useTransform(
    [
      face.faceOffsetX,
      face.pupilOffsetX,
      smoothAvertPupilX,
      smoothPasswordVisible,
    ],
    ([fx, px, ax, pv]) => {
      const normal = (fx as number) + (px as number);
      const avert = ax as number;
      return normal * (1 - (pv as number)) + avert * (pv as number);
    }
  );
  const rightPupilTotalY = useTransform(
    [
      face.faceOffsetY,
      face.pupilOffsetY,
      smoothAvertPupilY,
      smoothPasswordVisible,
    ],
    ([fy, py, ay, pv]) => {
      const normal = (fy as number) + (py as number);
      const avert = ay as number;
      return normal * (1 - (pv as number)) + avert * (pv as number);
    }
  );

  // Face offset - interpolate between normal and avert gaze
  const faceX = useTransform(
    [face.faceOffsetX, smoothAvertFaceX, smoothPasswordVisible],
    ([fx, ax, pv]) =>
      (fx as number) * (1 - (pv as number)) + (ax as number) * (pv as number)
  );
  const faceY = useTransform(
    [face.faceOffsetY, smoothAvertFaceY, smoothPasswordVisible],
    ([fy, ay, pv]) =>
      (fy as number) * (1 - (pv as number)) + (ay as number) * (pv as number)
  );

  return (
    <motion.g
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.g
        style={{
          skewX: leanSkew,
          transformOrigin: "bottom center",
        }}
      >
        <g>
          {/* Body: Rectangular pillar */}
          <rect
            x={bodyX}
            y={bodyY}
            width={bodyWidth}
            height={bodyHeight}
            fill="#1d2025"
            rx={2}
          />

          {/* Left Eye Sclera - moves with face */}
          <motion.circle
            r={10}
            fill="white"
            style={{
              x: faceX,
              y: faceY,
              translateX: faceCenterX + leftEyeOffsetX,
              translateY: faceCenterY + eyeOffsetY,
            }}
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 2,
              delay: 1,
            }}
          />

          {/* Left Eye Pupil - moves with face + additional pupil movement */}
          <motion.circle
            r={5}
            fill="black"
            style={{
              x: leftPupilTotalX,
              y: leftPupilTotalY,
              translateX: faceCenterX + leftEyeOffsetX,
              translateY: faceCenterY + eyeOffsetY,
            }}
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 2,
              delay: 1,
            }}
          />

          {/* Right Eye Sclera - moves with face */}
          <motion.circle
            r={10}
            fill="white"
            style={{
              x: faceX,
              y: faceY,
              translateX: faceCenterX + rightEyeOffsetX,
              translateY: faceCenterY + eyeOffsetY,
            }}
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 2,
              delay: 1,
            }}
          />

          {/* Right Eye Pupil - moves with face + additional pupil movement */}
          <motion.circle
            r={6}
            fill="black"
            style={{
              x: rightPupilTotalX,
              y: rightPupilTotalY,
              translateX: faceCenterX + rightEyeOffsetX,
              translateY: faceCenterY + eyeOffsetY,
            }}
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 2,
              delay: 1,
            }}
          />

          {/* No mouth - the silent type */}
        </g>
      </motion.g>
    </motion.g>
  );
}
