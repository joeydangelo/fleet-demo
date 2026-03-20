import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export const InputCursor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blink = Math.floor(frame / (fps * 0.4)) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 15,
        backgroundColor: blink ? "#333" : "transparent",
        marginLeft: 1,
        verticalAlign: "text-bottom",
      }}
    />
  );
};
