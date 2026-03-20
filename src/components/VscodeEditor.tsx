import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import {
  SPEC_EDITOR_START,
  SECOND_PROMPT_START,
  YAML_WRITE_START,
  TIMER2_START,
} from "../constants/timing";
import { MONO } from "../constants/theme";
import {
  SPEC_FILENAME,
  SPEC_LINES,
  type SpecLineStyle,
} from "../constants/specContent";
import {
  YAML_FILENAME,
  YAML_LINES,
  type YamlLineStyle,
} from "../constants/yamlContent";

/** Color mapping for spec line styles — dark VSCode-like theme */
const SPEC_COLORS: Record<SpecLineStyle, string> = {
  frontmatter: "#ce9178",
  h1: "#569cd6",
  h2: "#569cd6",
  body: "#d4d4d4",
  blank: "transparent",
  list: "#d4d4d4",
  codeblock: "#808080",
  "code-key": "#9cdcfe",
  "code-value": "#ce9178",
};

/** Color mapping for YAML line styles */
const YAML_COLORS: Record<YamlLineStyle, string> = {
  comment: "#6a9955",
  key: "#9cdcfe",
  "key-value": "#9cdcfe",
  "list-item": "#ce9178",
  "prompt-body": "#ce9178",
  blank: "transparent",
};

function specFontWeight(style: SpecLineStyle): number {
  if (style === "h1") return 700;
  if (style === "h2") return 600;
  return 400;
}

/** Markdown file icon — filled blue downward arrow with stem */
const MarkdownIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M6 2h4v6h3l-5 6-5-6h3V2z" fill="#519aba" />
  </svg>
);

/** YAML file icon — purple exclamation mark */
const YamlIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="7" y="2" width="2" height="8" rx="1" fill="#a074c4" />
    <rect x="7" y="12" width="2" height="2" rx="1" fill="#a074c4" />
  </svg>
);

/** Small icon for the title bar — grid/layout buttons */
const TitleBarIcon: React.FC<{ d: string }> = ({ d }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d={d} stroke="#808080" strokeWidth="1" fill="none" />
  </svg>
);

/** Small icon for the tab bar — split/list buttons */
const TabBarIcon: React.FC<{ d: string }> = ({ d }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d={d} stroke="#888" strokeWidth="1" fill="none" />
  </svg>
);

/** Breadcrumb `>` separator */
const BreadcrumbChevron: React.FC = () => (
  <span style={{ color: "#666", fontSize: 10, margin: "0 1px" }}>›</span>
);

const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';
const STATUS_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';

const LINE_HEIGHT = 20;
const VISIBLE_LINES = 24;

/** Duration of the crossfade between spec and yaml content */
const CROSSFADE_FRAMES = 12;

export const VscodeEditor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - SPEC_EDITOR_START;
  if (localFrame < 0) return null;

  // Spring entrance — slide in from right + fade
  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 200 },
  });

  const translateX = interpolate(entrance, [0, 1], [60, 0]);
  const opacity = entrance;

  // --- Which file is active? ---
  // Small delay so the CLI "Write" line registers before the editor swaps
  const YAML_SWAP_DELAY = 15;
  const yamlSwapStart = YAML_WRITE_START + YAML_SWAP_DELAY;
  const showingYaml = frame >= yamlSwapStart;

  // Crossfade progress: 0 = spec, 1 = yaml
  const crossfade = interpolate(
    frame,
    [yamlSwapStart, yamlSwapStart + CROSSFADE_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // --- Spec scroll ---
  const specScrollStart = 25;
  const specScrollEnd = SECOND_PROMPT_START - SPEC_EDITOR_START - 20;
  const specScrollDuration = Math.max(30, specScrollEnd - specScrollStart);
  const specContentHeight = SPEC_LINES.length * LINE_HEIGHT;
  const specMaxScroll = Math.max(0, specContentHeight - VISIBLE_LINES * LINE_HEIGHT);
  const specScrollY = interpolate(
    localFrame,
    [specScrollStart, specScrollStart + specScrollDuration],
    [0, specMaxScroll],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) },
  );

  // --- YAML scroll ---
  const yamlLocalFrame = frame - yamlSwapStart;
  const yamlScrollStart = CROSSFADE_FRAMES + 10;
  const yamlScrollEnd = TIMER2_START - yamlSwapStart - 10;
  const yamlScrollDuration = yamlScrollEnd - yamlScrollStart;
  const yamlContentHeight = YAML_LINES.length * LINE_HEIGHT;
  const yamlMaxScroll = Math.max(0, yamlContentHeight - VISIBLE_LINES * LINE_HEIGHT);
  const yamlScrollY = interpolate(
    yamlLocalFrame,
    [yamlScrollStart, yamlScrollStart + yamlScrollDuration],
    [0, yamlMaxScroll],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) },
  );

  const activeFilename = showingYaml ? YAML_FILENAME : SPEC_FILENAME;

  return (
    <div
      style={{
        width: 580,
        height: 580,
        display: "flex",
        flexDirection: "column",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)",
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 34,
          backgroundColor: "#2d2d2d",
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          paddingRight: 16,
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28c840" }} />
        </div>

        {/* Centered title */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "#999",
            fontSize: 12,
            fontFamily: SYSTEM_FONT,
            fontWeight: 500,
          }}
        >
          {activeFilename}
        </div>

        {/* Right icons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <TitleBarIcon d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" />
          <TitleBarIcon d="M3 3h4v10H3zM9 3h4v10H9z" />
          <TitleBarIcon d="M3 3h10v4H3zM3 9h10v4H3z" />
          <TitleBarIcon d="M3 3h10v10H3z" />
        </div>
      </div>

      {/* Tab strip */}
      <div
        style={{
          height: 36,
          backgroundColor: "#2d2d2d",
          display: "flex",
          alignItems: "stretch",
          flexShrink: 0,
        }}
      >
        {/* Active tab */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingLeft: 12,
            paddingRight: 10,
            backgroundColor: "#1e1e1e",
          }}
        >
          {showingYaml ? <YamlIcon /> : <MarkdownIcon />}
          <span
            style={{
              color: "#cccccc",
              fontSize: 12,
              fontFamily: SYSTEM_FONT,
              fontWeight: 400,
              letterSpacing: 0.2,
            }}
          >
            {activeFilename}
          </span>
          <span style={{ color: "#888", fontSize: 14, marginLeft: 4, lineHeight: 1 }}>
            ×
          </span>
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 14 }}>
          <TabBarIcon d="M3 3h4v10H3zM9 3h4v10H9z" />
          <span style={{ color: "#888", fontSize: 16, letterSpacing: 2, lineHeight: 1 }}>···</span>
        </div>
      </div>

      {/* Editor content — crossfade between spec and yaml */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#1e1e1e",
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 22,
            display: "flex",
            alignItems: "center",
            gap: 4,
            paddingLeft: 12,
            fontFamily: SYSTEM_FONT,
            fontSize: 11,
            zIndex: 1,
            backgroundColor: "#1e1e1e",
          }}
        >
          {showingYaml ? (
            <>
              <span style={{ color: "#aaa" }}>fleet</span>
              <BreadcrumbChevron />
              <span style={{ color: "#aaa" }}>.fleet</span>
              <BreadcrumbChevron />
              <span style={{ color: "#ccc" }}>{YAML_FILENAME}</span>
              <BreadcrumbChevron />
              <span style={{ color: "#888" }}>…</span>
            </>
          ) : (
            <>
              <span style={{ color: "#aaa" }}>fleet</span>
              <BreadcrumbChevron />
              <span style={{ color: "#aaa" }}>.fleet</span>
              <BreadcrumbChevron />
              <span style={{ color: "#aaa" }}>specs</span>
              <BreadcrumbChevron />
              <span style={{ color: "#ccc" }}>{SPEC_FILENAME}</span>
              <BreadcrumbChevron />
              <span style={{ color: "#888" }}>…</span>
            </>
          )}
        </div>

        {/* Spec content — fades out when yaml arrives */}
        {crossfade < 1 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              opacity: 1 - crossfade,
            }}
          >
            <LineNumberGutter lines={SPEC_LINES.length} scrollY={specScrollY} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  paddingTop: 26,
                  paddingLeft: 12,
                  paddingRight: 12,
                  transform: `translateY(${-specScrollY}px)`,
                }}
              >
                {SPEC_LINES.map((line, i) => (
                  <SpecLineRow key={i} line={line} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* YAML content — fades in */}
        {crossfade > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              opacity: crossfade,
            }}
          >
            <LineNumberGutter lines={YAML_LINES.length} scrollY={yamlScrollY} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  paddingTop: 26,
                  paddingLeft: 12,
                  paddingRight: 12,
                  transform: `translateY(${-yamlScrollY}px)`,
                }}
              >
                {YAML_LINES.map((line, i) => (
                  <YamlLineRow key={i} line={line} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        style={{
          height: 20,
          backgroundColor: "#007acc",
          display: "flex",
          alignItems: "center",
          paddingLeft: 12,
          paddingRight: 12,
          flexShrink: 0,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily: STATUS_FONT,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="6" cy="4" r="2" stroke="#fff" strokeWidth="1.5" fill="none" />
              <circle cx="6" cy="12" r="2" stroke="#fff" strokeWidth="1.5" fill="none" />
              <line x1="6" y1="6" x2="6" y2="10" stroke="#fff" strokeWidth="1.5" />
              <path d="M8 12h2c1 0 2-1 2-2V6" stroke="#fff" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="4" r="2" stroke="#fff" strokeWidth="1.5" fill="none" />
            </svg>
            main
          </span>
          <span style={{ color: "#fff", fontSize: 11, fontFamily: STATUS_FONT }}>
            ⨂ 0 ⚠ 0
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <StatusBarItem>Ln 1, Col 1</StatusBarItem>
          <StatusBarItem>Spaces: 2</StatusBarItem>
          <StatusBarItem>UTF-8</StatusBarItem>
          <StatusBarItem>LF</StatusBarItem>
          <StatusBarItem>
            {"{"} {"}"} {showingYaml ? "YAML" : "Markdown"}
          </StatusBarItem>
        </div>
      </div>
    </div>
  );
};

/** Reusable status bar text item */
const StatusBarItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      color: "#fff",
      fontSize: 11,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    }}
  >
    {children}
  </span>
);

/** Line number gutter — shared between spec and yaml */
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

/** Renders a single spec line with syntax highlighting */
const SpecLineRow: React.FC<{ line: { text: string; style: SpecLineStyle } }> = ({
  line,
}) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 12,
      lineHeight: "20px",
      color: SPEC_COLORS[line.style],
      fontWeight: specFontWeight(line.style),
      whiteSpace: "pre",
      minHeight: 20,
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

/** Renders a single YAML line with syntax highlighting */
const YamlLineRow: React.FC<{ line: { text: string; style: YamlLineStyle } }> = ({
  line,
}) => {
  const baseStyle: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 12,
    lineHeight: "20px",
    whiteSpace: "pre",
    minHeight: 20,
  };

  if (line.style === "blank") {
    return <div style={{ ...baseStyle, color: "transparent" }}>{" "}</div>;
  }

  if (line.style === "comment") {
    return <div style={{ ...baseStyle, color: YAML_COLORS.comment }}>{line.text}</div>;
  }

  if (line.style === "key") {
    return <div style={{ ...baseStyle, color: YAML_COLORS.key }}>{line.text}</div>;
  }

  if (line.style === "key-value") {
    const colonIdx = line.text.indexOf(": ");
    if (colonIdx === -1) {
      return <div style={{ ...baseStyle, color: YAML_COLORS.key }}>{line.text}</div>;
    }
    const key = line.text.slice(0, colonIdx);
    const value = line.text.slice(colonIdx + 2);
    // Block scalar indicator | is purple punctuation, not a string value
    const valueColor = value === "|" ? "#a074c4" : "#ce9178";
    return (
      <div style={baseStyle}>
        <span style={{ color: "#9cdcfe" }}>{key}</span>
        <span style={{ color: "#d4d4d4" }}>: </span>
        <span style={{ color: valueColor }}>{value}</span>
      </div>
    );
  }

  if (line.style === "list-item") {
    const dashIdx = line.text.indexOf("- ");
    if (dashIdx === -1) {
      return <div style={{ ...baseStyle, color: YAML_COLORS["list-item"] }}>{line.text}</div>;
    }
    const indent = line.text.slice(0, dashIdx);
    const value = line.text.slice(dashIdx + 2);
    return (
      <div style={baseStyle}>
        <span>{indent}</span>
        <span style={{ color: "#d4d4d4" }}>- </span>
        <span style={{ color: "#ce9178" }}>{value}</span>
      </div>
    );
  }

  // prompt-body
  return <div style={{ ...baseStyle, color: YAML_COLORS["prompt-body"] }}>{line.text}</div>;
};
