import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect } from "react";
import { useFaceTracking } from "./useEyeTracking";

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
export function Gloop({
  cursorX,
  cursorY,
  isFormFocused = false,
  isPasswordVisible = false,
}: GloopProps) {
  // Body dimensions (dome shape)
  const bodyLeft = 60;
  const bodyRight = 260;
  const bodyTop = 230;
  // const bodyBottom = 360;
  const bodyWidth = bodyRight - bodyLeft; // 200

  // Head region (upper portion of dome)
  const headHeight = 80;
  const headCenterX = bodyLeft + bodyWidth / 2; // 160
  const headCenterY = bodyTop + headHeight / 2; // 270

  // Face center starts at head center
  const faceCenterX = headCenterX;
  const faceCenterY = headCenterY;

  // Eye positions relative to face center
  const leftEyeOffsetX = -25;
  const rightEyeOffsetX = 25;
  const eyeOffsetY = 0;

  // Mouth position relative to face center
  const mouthOffsetY = 10;
  const mouthHalfWidth = 11; // Distance from center to smile endpoints
  const mouthCurveDepth = 19; // How deep the smile curves down

  // Face tracking - entire face moves together
  const face = useFaceTracking(faceCenterX, faceCenterY, cursorX, cursorY, {
    maxFaceShift: 15,
    maxPupilDistance: 0, // No pupils for Gloop
  });

  // Averting gaze state - eyes look left when password is visible
  const avertGazeX = useMotionValue(0);
  const avertGazeY = useMotionValue(0);
  const smoothAvertX = useSpring(avertGazeX, { stiffness: 120, damping: 20 });
  const smoothAvertY = useSpring(avertGazeY, { stiffness: 120, damping: 20 });

  // Password visible as MotionValue for reactive transforms
  const passwordVisibleFactor = useMotionValue(0);
  const smoothPasswordVisible = useSpring(passwordVisibleFactor, {
    stiffness: 120,
    damping: 20,
  });

  useEffect(() => {
    // When password visible, simulate cursor at extreme left
    avertGazeX.set(isPasswordVisible ? -15 : 0);
    avertGazeY.set(isPasswordVisible ? 0 : 0);
    passwordVisibleFactor.set(isPasswordVisible ? 1 : 0);
  }, [isPasswordVisible, avertGazeX, avertGazeY, passwordVisibleFactor]);

  // Face offset - interpolate between normal and avert gaze
  const faceX = useTransform(
    [face.faceOffsetX, smoothAvertX, smoothPasswordVisible],
    ([fx, ax, pv]) =>
      (fx as number) * (1 - (pv as number)) + (ax as number) * (pv as number)
  );
  const faceY = useTransform(
    [face.faceOffsetY, smoothAvertY, smoothPasswordVisible],
    ([fy, ay, pv]) =>
      (fy as number) * (1 - (pv as number)) + (ay as number) * (pv as number)
  );

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
    leanSkewValue.set(isFormFocused && !isPasswordVisible ? -3 : 0);
  }, [isFormFocused, isPasswordVisible, leanSkewValue]);

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.g
        style={{
          skewX: leanSkew,
          transformOrigin: "bottom center",
        }}
      >
        <g>
          {/* Body: Large semi-circle dome */}
          <path
            d="M 60 360 Q 60 230, 160 230 Q 260 230, 260 360 Z"
            fill="#ff8a28"
          />

          {/* Left Eye - changes based on password visibility */}
          {isPasswordVisible ? (
            /* Password visible: Curved arch (^ ^) - squinting/closed eye */
            <motion.path
              d={`M ${faceCenterX + leftEyeOffsetX - 8} ${faceCenterY + eyeOffsetY + 3} Q ${faceCenterX + leftEyeOffsetX} ${faceCenterY + eyeOffsetY - 6}, ${faceCenterX + leftEyeOffsetX + 8} ${faceCenterY + eyeOffsetY + 3}`}
              stroke="black"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
              style={{
                x: faceX,
                y: faceY,
              }}
            />
          ) : (
            /* Default: Simple black dot - moves with face */
            <motion.circle
              r={6}
              fill="black"
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
                delay: 0.5,
              }}
            />
          )}

          {/* Right Eye - changes based on password visibility */}
          {isPasswordVisible ? (
            /* Password visible: Curved arch (^ ^) - squinting/closed eye */
            <motion.path
              d={`M ${faceCenterX + rightEyeOffsetX - 8} ${faceCenterY + eyeOffsetY + 3} Q ${faceCenterX + rightEyeOffsetX} ${faceCenterY + eyeOffsetY - 6}, ${faceCenterX + rightEyeOffsetX + 8} ${faceCenterY + eyeOffsetY + 3}`}
              stroke="black"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
              style={{
                x: faceX,
                y: faceY,
              }}
            />
          ) : (
            /* Default: Simple black dot - moves with face */
            <motion.circle
              r={6}
              fill="black"
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
                delay: 0.5,
              }}
            />
          )}

          {/* Mouth - changes based on focus and password visibility state */}
          {isPasswordVisible ? (
            /* Password visible: Small open circle shifted to the left */
            <motion.circle
              r={5}
              fill="black"
              style={{
                x: faceX,
                y: faceY,
                translateX: faceCenterX - 10,
                translateY: faceCenterY + mouthOffsetY + 5,
              }}
            />
          ) : isFormFocused ? (
            /* Focused: Stunned dot mouth (same size as eyes) */
            <motion.circle
              r={6}
              fill="black"
              style={{
                x: faceX,
                y: faceY,
                translateX: faceCenterX,
                translateY: faceCenterY + mouthOffsetY + 8,
              }}
            />
          ) : (
            /* Default: Filled smile curve */
            <motion.path
              d={`M ${faceCenterX - mouthHalfWidth} ${
                faceCenterY + mouthOffsetY
              } Q ${faceCenterX} ${faceCenterY + mouthOffsetY + mouthCurveDepth}, ${
                faceCenterX + mouthHalfWidth
              } ${faceCenterY + mouthOffsetY} Z`}
              fill="black"
              style={{
                x: faceX,
                y: faceY,
              }}
            />
          )}
        </g>
      </motion.g>
    </motion.g>
  );
}
