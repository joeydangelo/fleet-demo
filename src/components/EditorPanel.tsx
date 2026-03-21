import React from "react";
import { MONO } from "../constants/theme";
import {
  SPEC_COLORS,
  YAML_COLORS,
  YAML_KEY_COLOR,
  YAML_COLON_COLOR,
  YAML_STRING_COLOR,
  YAML_PIPE_COLOR,
  specFontWeight,
  STATUS_FONT,
} from "./vscode/colors";
import type { SpecLineStyle } from "../constants/specContent";
import type { YamlLineStyle } from "../constants/yamlContent";

const EDITOR_LINE_BASE_STYLE: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 12,
  lineHeight: "20px",
  whiteSpace: "pre",
  minHeight: 20,
};

// ── Line renderers ───────────────────────────────────────────────────

export const SpecLineRow: React.FC<{ line: { text: string; style: SpecLineStyle } }> = ({
  line,
}) => (
  <div
    style={{
      ...EDITOR_LINE_BASE_STYLE,
      color: SPEC_COLORS[line.style],
      fontWeight: specFontWeight(line.style),
    }}
  >
    {line.style === "list" && line.text.startsWith("- ") ? (
      <>
        <span style={{ color: "#569cd6" }}>-</span>
        {line.text.slice(1)}
      </>
    ) : (
      line.text
    )}
  </div>
);

export const YamlLineRow: React.FC<{ line: { text: string; style: YamlLineStyle } }> = ({
  line,
}) => {
  if (line.style === "key-value") {
    const colonIdx = line.text.indexOf(": ");
    if (colonIdx === -1) {
      return <div style={{ ...EDITOR_LINE_BASE_STYLE, color: YAML_COLORS.key }}>{line.text}</div>;
    }
    const key = line.text.slice(0, colonIdx);
    const value = line.text.slice(colonIdx + 2);
    const valueColor = value === "|" ? YAML_PIPE_COLOR : YAML_STRING_COLOR;
    return (
      <div style={EDITOR_LINE_BASE_STYLE}>
        <span style={{ color: YAML_KEY_COLOR }}>{key}</span>
        <span style={{ color: YAML_COLON_COLOR }}>: </span>
        <span style={{ color: valueColor }}>{value}</span>
      </div>
    );
  }

  if (line.style === "list-item") {
    const dashIdx = line.text.indexOf("- ");
    if (dashIdx === -1) {
      return <div style={{ ...EDITOR_LINE_BASE_STYLE, color: YAML_COLORS["list-item"] }}>{line.text}</div>;
    }
    const indent = line.text.slice(0, dashIdx);
    const value = line.text.slice(dashIdx + 2);
    return (
      <div style={EDITOR_LINE_BASE_STYLE}>
        <span>{indent}</span>
        <span style={{ color: YAML_COLON_COLOR }}>- </span>
        <span style={{ color: YAML_STRING_COLOR }}>{value}</span>
      </div>
    );
  }

  // All other styles: comment, key, blank, prompt-body
  return (
    <div style={{ ...EDITOR_LINE_BASE_STYLE, color: YAML_COLORS[line.style] }}>
      {line.style === "blank" ? " " : line.text}
    </div>
  );
};

// ── Editor panel + gutter ────────────────────────────────────────────

type EditorPanelProps<T> = {
  opacity: number;
  lines: T[];
  scrollY: number;
  LineComponent: React.FC<{ line: T }>;
};

export function EditorPanel<T>({ opacity, lines, scrollY, LineComponent }: EditorPanelProps<T>): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        opacity,
      }}
    >
      <LineNumberGutter lines={lines.length} scrollY={scrollY} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div
          style={{
            paddingTop: 26,
            paddingLeft: 12,
            paddingRight: 12,
            transform: `translateY(${-scrollY}px)`,
          }}
        >
          {lines.map((line, i) => (
            <LineComponent key={i} line={line} />
          ))}
        </div>
      </div>
    </div>
  );
}

const LineNumberGutter: React.FC<{ lines: number; scrollY: number }> = ({
  lines,
  scrollY,
}) => (
  <div
    style={{
      width: 44,
      backgroundColor: "#1e1e1e",
      paddingRight: 8,
      textAlign: "right",
      flexShrink: 0,
      overflow: "hidden",
    }}
  >
    <div style={{ paddingTop: 26, transform: `translateY(${-scrollY}px)` }}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          style={{
            fontFamily: MONO,
            fontSize: 12,
            lineHeight: "20px",
            color: "#5a5a5a",
            userSelect: "none",
          }}
        >
          {i + 1}
        </div>
      ))}
    </div>
  </div>
);

// ── Status bar item ──────────────────────────────────────────────────

export const StatusBarItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      color: "#fff",
      fontSize: 11,
      fontFamily: STATUS_FONT,
    }}
  >
    {children}
  </span>
);
