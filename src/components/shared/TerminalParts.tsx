import React from "react";
import { DIM, GRAY, TOOL_INDENT } from "../../constants/theme";

export const Dot: React.FC<{ color: string; char?: string }> = ({
  color,
  char = "\u25cf",
}) => (
  <span style={{ color, fontSize: 14, marginRight: 6 }}>{char}</span>
);

export const CollapsedOutput: React.FC<{ lines: number }> = ({ lines }) => (
  <div style={{ paddingLeft: TOOL_INDENT, color: DIM, fontSize: 12 }}>
    <span style={{ marginRight: 4 }}>{"\u23bf"}</span>
    <span>{"\u2026"} +{lines} lines (ctrl+o to expand)</span>
  </div>
);

export const SubLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ paddingLeft: TOOL_INDENT, color: GRAY, fontSize: 12 }}>
    <span style={{ marginRight: 4 }}>{"\u23bf"}</span>
    {children}
  </div>
);
