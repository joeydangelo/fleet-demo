import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { DIM, ORANGE } from "../../constants/theme";

const SPINNER_FRAMES = [
  { char: "\u00b7", hold: 2 },
  { char: "\u2722", hold: 1 },
  { char: "\u2733", hold: 1 },
  { char: "\u2736", hold: 1 },
  { char: "\u273b", hold: 1 },
  { char: "\u273d", hold: 2 },
];

const SpinningDot: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const baseFramesPerChar = Math.round(fps * 0.12);
  const totalCycleFrames = SPINNER_FRAMES.reduce(
    (sum, { hold }) => sum + baseFramesPerChar + hold,
    0,
  );
  const cycleFrame = frame % totalCycleFrames;
  let accumulated = 0;
  let charIndex = 0;
  for (let i = 0; i < SPINNER_FRAMES.length; i++) {
    accumulated += baseFramesPerChar + SPINNER_FRAMES[i].hold;
    if (cycleFrame < accumulated) {
      charIndex = i;
      break;
    }
  }
  return (
    <span
      style={{
        color,
        fontSize: 14,
        marginRight: 6,
        display: "inline-block",
        width: 14,
        textAlign: "center",
      }}
    >
      {SPINNER_FRAMES[charIndex].char}
    </span>
  );
};

export const StatusLine: React.FC<{
  seconds: string;
  tokens: string;
  label?: string;
  tokenDirection?: "↑" | "↓";
}> = ({ seconds, tokens, label = "Scurrying\u2026", tokenDirection = "\u2191" }) => (
  <div
    style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}
  >
    <SpinningDot color={ORANGE} />
    <span style={{ color: ORANGE, fontWeight: 600, fontSize: 12 }}>
      {label}
    </span>
    <span style={{ color: DIM, fontSize: 12 }}>
      ({seconds} {"\u00b7"} {tokenDirection} {tokens} tokens)
    </span>
  </div>
);
