import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { DIM, GRAY, TEXT } from "../../constants/theme";

type ScoutData = {
  name: string;
  toolUses: number;
  tokens: number;
  doneFrame: number;
};

type ScoutRowProps = ScoutData & {
  startFrame: number;
  isLast: boolean;
};

export const ScoutRow: React.FC<ScoutRowProps> = ({
  name,
  toolUses,
  tokens,
  startFrame,
  doneFrame,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const isDone = frame >= doneFrame;
  const connector = isLast ? "\u2514\u2500" : "\u251c\u2500";

  const duration = doneFrame - startFrame;

  let displayToolUses = toolUses;
  let displayTokens = `${tokens.toFixed(1)}k`;

  if (!isDone) {
    const third = duration / 3;
    const elapsed = Math.max(0, frame - startFrame);
    const ratio = elapsed < third ? 0.4 : 0.7;
    displayToolUses = Math.round(toolUses * ratio);
    displayTokens = `${(tokens * ratio).toFixed(1)}k`;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        opacity: isDone
          ? interpolate(frame, [doneFrame, doneFrame + 8], [0.6, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.ease),
            })
          : 0.6,
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
        {name} {"\u00b7"} {displayToolUses} tool uses {"\u00b7"} {displayTokens}{" "}
        tokens
      </span>
    </div>
  );
};

export type { ScoutData };
