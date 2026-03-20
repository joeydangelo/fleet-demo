import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

const FADE_CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: Easing.out(Easing.ease),
};

export const FadeIn: React.FC<{
  start: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ start, children, style }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  return (
    <div
      style={{
        opacity: interpolate(frame, [start, start + 8], [0, 1], FADE_CLAMP),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
