import React from "react";

export const MouseCursor: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 14,
      height: 20,
      zIndex: 10,
      pointerEvents: "none",
      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
    }}
  >
    <svg
      width="14"
      height="20"
      viewBox="0 0 14 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L1 16L5 12L8 18.5L10.5 17.5L7.5 10.5L12.5 10L1 1Z"
        fill="#333"
        stroke="white"
        strokeWidth="1.2"
      />
    </svg>
  </div>
);
