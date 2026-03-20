import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import {
  SPEC_EDITOR_START,
  SECOND_PROMPT_START,
  YAML_WRITE_START,
  TIMER2_START,
} from "../constants/timing";
import { MONO, SPRING_LAYOUT } from "../constants/theme";
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
import {
  MarkdownIcon,
  YamlIcon,
  TitleBarIcon,
  TabBarIcon,
  BreadcrumbChevron,
  GitBranchIcon,
} from "./vscode/icons";
import {
  SPEC_COLORS,
  YAML_COLORS,
  YAML_KEY_COLOR,
  YAML_COLON_COLOR,
  YAML_STRING_COLOR,
  YAML_PIPE_COLOR,
  specFontWeight,
  SYSTEM_FONT,
  STATUS_FONT,
} from "./vscode/colors";
import { TrafficLights } from "./shared";

const LINE_HEIGHT = 20;
const VISIBLE_LINES = 24;
const CROSSFADE_FRAMES = 12;
const YAML_SWAP_DELAY = 15;

const EDITOR_LINE_BASE_STYLE: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 12,
  lineHeight: "20px",
  whiteSpace: "pre",
  minHeight: 20,
};

function useEditorScroll(
  localFrame: number,
  scrollStart: number,
  scrollEnd: number,
  lineCount: number,
): number {
  const maxScroll = Math.max(0, lineCount * LINE_HEIGHT - VISIBLE_LINES * LINE_HEIGHT);
  const duration = Math.max(30, scrollEnd - scrollStart);
  return interpolate(
    localFrame,
    [scrollStart, scrollStart + duration],
    [0, maxScroll],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) },
  );
}

export const VscodeEditor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - SPEC_EDITOR_START;
  if (localFrame < 0) return null;

  const entrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_LAYOUT,
  });

  const translateX = interpolate(entrance, [0, 1], [60, 0]);
  const opacity = entrance;

  const yamlSwapStart = YAML_WRITE_START + YAML_SWAP_DELAY;
  const showingYaml = frame >= yamlSwapStart;

  const crossfade = interpolate(
    frame,
    [yamlSwapStart, yamlSwapStart + CROSSFADE_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const specScrollStart = 25;
  const specScrollEnd = SECOND_PROMPT_START - SPEC_EDITOR_START - 20;
  const specScrollY = useEditorScroll(localFrame, specScrollStart, specScrollEnd, SPEC_LINES.length);

  const yamlLocalFrame = frame - yamlSwapStart;
  const yamlScrollStart = CROSSFADE_FRAMES + 10;
  const yamlScrollEnd = TIMER2_START - yamlSwapStart - 10;
  const yamlScrollY = useEditorScroll(yamlLocalFrame, yamlScrollStart, yamlScrollEnd, YAML_LINES.length);

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
        <TrafficLights />

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

      {/* Editor content */}
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
          <span style={{ color: "#aaa" }}>fleet</span>
          <BreadcrumbChevron />
          <span style={{ color: "#aaa" }}>.fleet</span>
          <BreadcrumbChevron />
          {!showingYaml && (
            <>
              <span style={{ color: "#aaa" }}>specs</span>
              <BreadcrumbChevron />
            </>
          )}
          <span style={{ color: "#ccc" }}>{activeFilename}</span>
          <BreadcrumbChevron />
          <span style={{ color: "#888" }}>…</span>
        </div>

        {/* Spec content */}
        {crossfade < 1 && (
          <EditorPanel
            opacity={1 - crossfade}
            lines={SPEC_LINES}
            scrollY={specScrollY}
            LineComponent={SpecLineRow}
          />
        )}

        {/* YAML content */}
        {crossfade > 0 && (
          <EditorPanel
            opacity={crossfade}
            lines={YAML_LINES}
            scrollY={yamlScrollY}
            LineComponent={YamlLineRow}
          />
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
            <GitBranchIcon />
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

// --- Sub-components ---

const StatusBarItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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

type EditorPanelProps<T> = {
  opacity: number;
  lines: T[];
  scrollY: number;
  LineComponent: React.FC<{ line: T }>;
};

function EditorPanel<T>({ opacity, lines, scrollY, LineComponent }: EditorPanelProps<T>): React.ReactElement {
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

const SpecLineRow: React.FC<{ line: { text: string; style: SpecLineStyle } }> = ({
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

const YamlLineRow: React.FC<{ line: { text: string; style: YamlLineStyle } }> = ({
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
