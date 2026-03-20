import React from "react";
import { TEXT, TOOL_INDENT } from "../../constants/theme";

type SummaryBlockProps = {
  children: React.ReactNode;
};

export const SummaryBlock: React.FC<SummaryBlockProps> = ({ children }) => (
  <div
    style={{
      paddingLeft: TOOL_INDENT,
      fontSize: 12,
      color: TEXT,
      lineHeight: 1.7,
      maxWidth: 440,
    }}
  >
    {children}
  </div>
);

export const SummaryParagraph: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <p style={{ margin: "4px 0" }}>{children}</p>;
