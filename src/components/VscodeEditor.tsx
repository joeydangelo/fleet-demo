import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { SPEC_EDITOR_START, SECOND_PROMPT_START } from "../constants/timing";
import { MONO } from "../constants/theme";
import {
  SPEC_FILENAME,
  SPEC_LINES,
  type SpecLineStyle,
} from "../constants/specContent";

/** Color mapping for spec line styles — dark VSCode-like theme */
const STYLE_COLORS: Record<SpecLineStyle, string> = {
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

/** Returns font weight per style */
function fontWeightFor(style: SpecLineStyle): number {
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

  // Smooth scroll through spec — finishes just before user types approval
  const SCROLL_START = 25; // frames after editor appears
  const SCROLL_END = SECOND_PROMPT_START - SPEC_EDITOR_START - 20;
  const SCROLL_DURATION = SCROLL_END - SCROLL_START;
  const LINE_HEIGHT = 20;
  const VISIBLE_LINES = 24; // approximate visible lines in editor area
  const totalContentHeight = SPEC_LINES.length * LINE_HEIGHT;
  const maxScroll = Math.max(0, totalContentHeight - VISIBLE_LINES * LINE_HEIGHT);
  const scrollY = interpolate(
    localFrame,
    [SCROLL_START, SCROLL_START + SCROLL_DURATION],
    [0, maxScroll],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) },
  );

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

        {/* Centered title */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "#999",
            fontSize: 12,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
            fontWeight: 500,
          }}
        >
          {SPEC_FILENAME}
        </div>

        {/* Right icons — layout/grid buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <TitleBarIcon d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" />
          <TitleBarIcon d="M3 3h4v10H3zM9 3h4v10H9z" />
          <TitleBarIcon d="M3 3h10v4H3zM3 9h10v4H3z" />
          <TitleBarIcon d="M3 3h10v10H3z" />
        </div>
      </div>

      {/* Tab strip — blends smoothly with title bar */}
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
          <MarkdownIcon />
          <span
            style={{
              color: "#cccccc",
              fontSize: 12,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
              fontWeight: 400,
              letterSpacing: 0.2,
            }}
          >
            {SPEC_FILENAME}
          </span>
          <span
            style={{
              color: "#888",
              fontSize: 14,
              marginLeft: 4,
              lineHeight: 1,
            }}
          >
            ×
          </span>
        </div>

        {/* Right side icons — split view + more */}
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingRight: 14,
          }}
        >
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
        {/* Breadcrumb — floats above first line, no border */}
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
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
            fontSize: 11,
            zIndex: 1,
            backgroundColor: "#1e1e1e",
          }}
        >
          <span style={{ color: "#aaa" }}>fleet</span>
          <BreadcrumbChevron />
          <span style={{ color: "#aaa" }}>.fleet</span>
          <BreadcrumbChevron />
          <span style={{ color: "#aaa" }}>specs</span>
          <BreadcrumbChevron />
          <span style={{ color: "#ccc" }}>{SPEC_FILENAME}</span>
          <BreadcrumbChevron />
          <span style={{ color: "#888" }}>…</span>
        </div>

        {/* Line number gutter */}
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
          <div
            style={{
              paddingTop: 26,
              transform: `translateY(${-scrollY}px)`,
            }}
          >
            {SPEC_LINES.map((_, i) => (
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

        {/* Code area */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              paddingTop: 26,
              paddingLeft: 12,
              paddingRight: 12,
              transform: `translateY(${-scrollY}px)`,
            }}
          >
            {SPEC_LINES.map((line, i) => (
              <div
                key={i}
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  lineHeight: "20px",
                  color: STYLE_COLORS[line.style],
                  fontWeight: fontWeightFor(line.style),
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
            ))}
          </div>
        </div>
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
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
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
          <span
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            ⨂ 0 ⚠ 0
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            Ln 1, Col 1
          </span>
          <span
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            Spaces: 2
          </span>
          <span
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            UTF-8
          </span>
          <span
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            LF
          </span>
          <span
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            {"{"} {"}"} Markdown
          </span>
        </div>
      </div>
    </div>
  );
};
