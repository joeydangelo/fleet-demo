import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { DIM, GRAY, ORANGE, TEXT } from "../constants/theme";

export const Dot: React.FC<{ color: string; char?: string }> = ({
  color,
  char = "●",
}) => (
  <span style={{ color, fontSize: 14, marginRight: 6 }}>{char}</span>
);

export const CollapsedOutput: React.FC<{ lines: number }> = ({ lines }) => (
  <div style={{ paddingLeft: 22, color: DIM, fontSize: 12 }}>
    <span style={{ marginRight: 4 }}>⎿</span>
    <span>… +{lines} lines (ctrl+o to expand)</span>
  </div>
);

export const SubLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ paddingLeft: 22, color: GRAY, fontSize: 12 }}>
    <span style={{ marginRight: 4 }}>⎿</span>
    {children}
  </div>
);

const SPINNER_CHARS = ["·", "✢", "✳", "✶", "✻", "✽"];
// Hold first and last frames slightly longer for easing feel
const SPINNER_HOLDS = [2, 1, 1, 1, 1, 2]; // extra frames to hold each char

const SpinningDot: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // ~120ms per character = ~3.6 frames at 30fps, round to 4
  const baseFramesPerChar = Math.round(fps * 0.12);
  // Build total cycle length accounting for holds
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
}> = ({ seconds, tokens, label = "Scurrying…", tokenDirection = "↑" }) => (
  <div
    style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}
  >
    <SpinningDot color={ORANGE} />
    <span style={{ color: ORANGE, fontWeight: 600, fontSize: 12 }}>
      {label}
    </span>
    <span style={{ color: DIM, fontSize: 12 }}>
      ({seconds} · {tokenDirection} {tokens} tokens)
    </span>
  </div>
);

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

// Scout agent row — token/tool counts tick up in chunks while running, snap to final on done
export const ScoutRow: React.FC<{
  name: string;
  toolUses: number;
  tokens: string;
  startFrame: number;
  doneFrame: number;
  isLast: boolean;
}> = ({ name, toolUses, tokens, startFrame, doneFrame, isLast }) => {
  const frame = useCurrentFrame();
  const isDone = frame >= doneFrame;
  const connector = isLast ? "└─" : "├─";

  const finalTokens = parseFloat(tokens);
  const duration = doneFrame - startFrame;

  let displayToolUses = toolUses;
  let displayTokens = tokens;

  if (!isDone) {
    const third = duration / 3;
    const elapsed = Math.max(0, frame - startFrame);
    // 3 stages: start at ~40%, bump to ~70% at 1/3, then hold until done snaps to final
    if (elapsed < third) {
      const ratio = 0.4;
      displayToolUses = Math.round(toolUses * ratio);
      displayTokens = `${(finalTokens * ratio).toFixed(1)}k`;
    } else {
      const ratio = 0.7;
      displayToolUses = Math.round(toolUses * ratio);
      displayTokens = `${(finalTokens * ratio).toFixed(1)}k`;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        opacity: isDone ? 1 : 0.6,
        transition: "opacity 0.3s",
      }}
    >
      <span style={{ color: DIM, marginRight: 4 }}>{connector}</span>
      <span
        style={{
          color: isDone ? TEXT : GRAY,
          fontWeight: isDone ? 600 : 400,
          fontSize: 12,
        }}
      >
        {name} · {displayToolUses} tool uses · {displayTokens} tokens
      </span>
    </div>
  );
};
