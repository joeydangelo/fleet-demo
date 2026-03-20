import React from "react";

const COLORS = ["#ff5f57", "#febc2e", "#28c840"];

export const TrafficLights: React.FC = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {COLORS.map((color) => (
      <div
        key={color}
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
    ))}
  </div>
);
