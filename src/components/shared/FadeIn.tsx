import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

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
        opacity: interpolate(frame, [start, start + 8], [0, 1], {
          extrapolateRight: "clamp",
        }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
