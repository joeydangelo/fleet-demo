import React from "react";
import { useCurrentFrame } from "remotion";
import { DIM, GRAY, TEXT } from "../../constants/theme";

export const Dot: React.FC<{ color: string; char?: string }> = ({
  color,
  char = "\u25cf",
}) => (
  <span style={{ color, fontSize: 14, marginRight: 6 }}>{char}</span>
);

export const CollapsedOutput: React.FC<{ lines: number }> = ({ lines }) => (
  <div style={{ paddingLeft: 22, color: DIM, fontSize: 12 }}>
    <span style={{ marginRight: 4 }}>{"\u23bf"}</span>
    <span>{"\u2026"} +{lines} lines (ctrl+o to expand)</span>
  </div>
);

export const SubLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ paddingLeft: 22, color: GRAY, fontSize: 12 }}>
    <span style={{ marginRight: 4 }}>{"\u23bf"}</span>
    {children}
  </div>
);

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
  const connector = isLast ? "\u2514\u2500" : "\u251c\u2500";

  const finalTokens = parseFloat(tokens);
  const duration = doneFrame - startFrame;

  let displayToolUses = toolUses;
  let displayTokens = tokens;

  if (!isDone) {
    const third = duration / 3;
    const elapsed = Math.max(0, frame - startFrame);
    const ratio = elapsed < third ? 0.4 : 0.7;
    displayToolUses = Math.round(toolUses * ratio);
    displayTokens = `${(finalTokens * ratio).toFixed(1)}k`;
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
        {name} {"\u00b7"} {displayToolUses} tool uses {"\u00b7"} {displayTokens} tokens
      </span>
    </div>
  );
};
