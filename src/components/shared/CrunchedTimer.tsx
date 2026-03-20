import React from "react";
import { ORANGE } from "../../constants/theme";

type CrunchedTimerProps = {
  duration: string;
};

export const CrunchedTimer: React.FC<CrunchedTimerProps> = ({ duration }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ color: ORANGE, fontSize: 14, marginRight: 6 }}>✻</span>
    <span style={{ color: ORANGE, fontWeight: 600, fontSize: 12 }}>
      Crunched for {duration}
    </span>
  </div>
);
