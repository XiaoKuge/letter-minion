import {
  motion,
  useTransform,
  useSpring,
  useMotionValue,
  type MotionValue,
} from "motion/react";
import { useEffect } from "react";

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
export function Nugget({
  cursorX,
  cursorY,
  isFormFocused = false,
  isPasswordVisible = false,
}: NuggetProps) {
  // Body dimensions
  const bodyLeft = 320;
  const bodyRight = 420;
  const bodyTop = 230;
  const bodyWidth = bodyRight - bodyLeft; // 100
  const bodyCenterX = bodyLeft + bodyWidth / 2; // 370

  // Face center
  const faceCenterX = bodyCenterX;
  const faceCenterY = bodyTop - 10; // Near top of body

  // Avert gaze state - look left when password visible
  const avertRotation = useMotionValue(0);
  const smoothAvertRotation = useSpring(avertRotation, {
    stiffness: 100,
    damping: 15,
  });

  useEffect(() => {
    // -1 = looking left (averting gaze)
    avertRotation.set(isPasswordVisible ? -1 : 0);
  }, [isPasswordVisible, avertRotation]);

  // Calculate horizontal rotation factor (-1 = looking left, 0 = center, 1 = looking right)
  // When password visible, use avert rotation instead
  const rotationFactor = useSpring(
    useTransform([cursorX, smoothAvertRotation], ([cx, avert]) => {
      if (isPasswordVisible) return avert as number;
      const dx = (cx as number) - faceCenterX;
      // Normalize: -1 to 1 based on distance, with sensitivity
      return Math.max(-1, Math.min(1, dx / 150));
    }),
    { stiffness: 100, damping: 15 }
  );

  // Vertical factor for mouth position (-1 = up, 0 = center, 1 = down)
  const verticalFactor = useSpring(
    useTransform(cursorY, (cy) => {
      const dy = cy - faceCenterY;
      return Math.max(-1, Math.min(1, dy / 150));
    }),
    { stiffness: 100, damping: 15 }
  );

  // Eye positions - shift based on rotation to create 3D effect
  // Left eye: visible when looking right, hidden when looking left
  const leftEyeX = useTransform(rotationFactor, (r) => {
    // Base position is -35 from center, shifts with rotation
    return faceCenterX - 35 + r * 40;
  });
  // Left eye hidden when it goes past left edge of body
  const leftEyeVisible = useTransform(leftEyeX, (x) => x > bodyLeft + 10);

  // Right eye: visible when looking left, hidden when looking right
  const rightEyeX = useTransform(rotationFactor, (r) => {
    // Base position is +35 from center, shifts with rotation
    return faceCenterX + 35 + r * 40;
  });
  // Right eye hidden when it goes past right edge of body
  const rightEyeVisible = useTransform(rightEyeX, (x) => x < bodyRight - 10);

  // Eye Y position - moves up/down with cursor
  const eyeY = useTransform(verticalFactor, (v) => {
    return faceCenterY + v * 10;
  });

  // Mouth position and width - creates profile effect
  const mouthCenterX = useTransform(rotationFactor, (r) => {
    // Mouth shifts horizontally with rotation
    return faceCenterX + r * 30;
  });
  const mouthY = useTransform(verticalFactor, (v) => {
    // Mouth moves up/down slightly based on vertical cursor position
    return faceCenterY + 25 + v * 5;
  });
  const mouthWidth = useTransform(rotationFactor, (r) => {
    // Mouth gets shorter when viewed from side, longer when centered
    // At center (r=0): full width (40), at sides (r=±1): shorter (28)
    return 40 * (1 - Math.abs(r) * 0.3);
  });

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
    leanSkewValue.set(isFormFocused && !isPasswordVisible ? -5 : 0);
  }, [isFormFocused, isPasswordVisible, leanSkewValue]);

  return (
    <g>
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.g
          style={{
            skewX: leanSkew,
            transformOrigin: "bottom center",
          }}
        >
          <g>
            {/* Body: Rounded top, flat bottom (gumdrop/thumb shape) */}
            <path
              d="M 320 360 L 320 230 A 50 50 0 0 1 420 230 L 420 360 Z"
              fill="#f3d300"
            />

            {/* Left Eye: Hidden when behind body edge */}
            <motion.circle
              r={4}
              fill="black"
              style={{
                cx: leftEyeX,
                cy: eyeY,
                opacity: useTransform(leftEyeVisible, (v) => (v ? 1 : 0)),
              }}
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                repeatDelay: 2.0,
                delay: 1.5,
              }}
            />

            {/* Right Eye: Hidden when behind body edge */}
            <motion.circle
              r={4}
              fill="black"
              style={{
                cx: rightEyeX,
                cy: eyeY,
                opacity: useTransform(rightEyeVisible, (v) => (v ? 1 : 0)),
              }}
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                repeatDelay: 2.0,
                delay: 1.5,
              }}
            />

            {/* Mouth: Horizontal line that shifts and changes width */}
            <motion.line
              stroke="black"
              strokeWidth={4}
              strokeLinecap="round"
              x1={useTransform(
                [mouthCenterX, mouthWidth],
                ([cx, w]) => (cx as number) - (w as number)
              )}
              x2={useTransform(
                [mouthCenterX, mouthWidth],
                ([cx, w]) => (cx as number) + (w as number)
              )}
              y1={mouthY}
              y2={mouthY}
            />
          </g>
        </motion.g>
      </motion.g>
    </g>
  );
}
