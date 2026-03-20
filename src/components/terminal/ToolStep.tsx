import React from "react";
import { useCurrentFrame } from "remotion";
import { FadeIn, ToolHeader, CollapsedOutput } from "../shared";

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
      <ToolHeader label={label} />
      {frame >= start + delay && <CollapsedOutput lines={collapsedLines} />}
    </FadeIn>
  );
};
