import React from "react";
import { BLUE, TEXT } from "../../constants/theme";

type PromptLineProps = {
  text: string;
};

export const PromptLine: React.FC<PromptLineProps> = ({ text }) => (
  <div style={{ marginBottom: 12 }}>
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <span style={{ color: BLUE, marginRight: 8, fontWeight: 700 }}>
        {"\u276f"}
      </span>
      <span style={{ color: TEXT, whiteSpace: "pre-wrap" }}>{text}</span>
    </div>
  </div>
);
