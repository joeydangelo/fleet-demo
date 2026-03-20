import React from "react";

export const MacTerminal: React.FC = () => {
  return (
    <div
      style={{
        width: 520,
        height: 580,
        display: "flex",
        flexDirection: "column",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 12px 24px -8px rgba(0, 0, 0, 0.1)",
        border: "1px solid #d4d0ca",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 40,
          backgroundColor: "#e8e5df",
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          paddingRight: 16,
          borderBottom: "1px solid #d4d0ca",
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#ff5f57",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#febc2e",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#28c840",
            }}
          />
        </div>
        {/* Title */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "#6b6560",
            fontSize: 13,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
            fontWeight: 500,
            letterSpacing: 0.2,
          }}
        >
          claude
        </div>
        {/* Spacer for symmetry */}
        <div style={{ width: 52 }} />
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#faf9f7",
          padding: 20,
          fontFamily:
            '"SF Mono", "Monaco", "Menlo", "Consolas", monospace',
          fontSize: 13,
          lineHeight: 1.6,
          color: "#3d3d3d",
        }}
      />

      {/* Bottom input bar */}
      <div
        style={{
          backgroundColor: "#faf9f7",
          flexShrink: 0,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <div
          style={{
            borderTop: "1px solid #c8c4be",
            borderBottom: "1px solid #c8c4be",
            paddingTop: 14,
            paddingBottom: 14,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily:
                '"SF Mono", "Monaco", "Menlo", "Consolas", monospace',
              fontSize: 14,
              color: "#999",
            }}
          >
            {">"} type a message or /help
          </span>
        </div>
      </div>
    </div>
  );
};
