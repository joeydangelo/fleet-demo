import React from "react";
import { GREEN, BOLD_TEXT } from "../../constants/theme";
import { Dot } from "./TerminalParts";

type ToolHeaderProps = {
  label: string;
  color?: string;
};

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  label,
  color = GREEN,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <Dot color={color} />
    <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
      {label}
    </span>
  </div>
);
