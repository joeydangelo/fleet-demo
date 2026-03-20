import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { DIM, ORANGE } from "../../constants/theme";

const SPINNER_CHARS = ["\u00b7", "\u2722", "\u2733", "\u2736", "\u273b", "\u273d"];
const SPINNER_HOLDS = [2, 1, 1, 1, 1, 2];

const SpinningDot: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const baseFramesPerChar = Math.round(fps * 0.12);
  const totalCycleFrames = SPINNER_HOLDS.reduce(
    (sum, hold) => sum + baseFramesPerChar + hold,
    0,
  );
  const cycleFrame = frame % totalCycleFrames;
  let accumulated = 0;
  let charIndex = 0;
  for (let i = 0; i < SPINNER_CHARS.length; i++) {
    accumulated += baseFramesPerChar + SPINNER_HOLDS[i];
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
      {SPINNER_CHARS[charIndex]}
    </span>
  );
};

export const StatusLine: React.FC<{
  seconds: string;
  tokens: string;
  label?: string;
  tokenDirection?: string;
}> = ({ seconds, tokens, label = "Scurrying\u2026", tokenDirection = "\u2191" }) => (
  <div
    style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}
  >
    <SpinningDot color={ORANGE} />
    <span style={{ color: ORANGE, fontWeight: 600, fontSize: 12 }}>
      {label}
    </span>
    <span style={{ color: DIM, fontSize: 12 }}>
      ({seconds} \u00b7 {tokenDirection} {tokens} tokens)
    </span>
  </div>
);
