import React from "react";
import { useCurrentFrame } from "remotion";
import { GREEN, BOLD_TEXT } from "../../constants/theme";
import { Dot, CollapsedOutput } from "../shared";
import { FadeIn } from "../shared/FadeIn";

type ToolStepProps = {
  label: string;
  start: number;
  collapsedLines: number;
  delay?: number;
  style?: React.CSSProperties;
};

export const ToolStep: React.FC<ToolStepProps> = ({
  label,
  start,
  collapsedLines,
  delay = 10,
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <FadeIn start={start} style={{ marginBottom: 4, marginTop: 8, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Dot color={GREEN} />
        <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
          {label}
        </span>
      </div>
      {frame >= start + delay && <CollapsedOutput lines={collapsedLines} />}
    </FadeIn>
  );
};
