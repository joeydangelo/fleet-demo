import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import {
  SPEC_EDITOR_START,
  SECOND_PROMPT_START,
  YAML_WRITE_START,
  TIMER2_START,
} from "../constants/timing";
import { SYSTEM_FONT, SPRING_LAYOUT } from "../constants/theme";
import { SPEC_FILENAME, SPEC_LINES } from "../constants/specContent";
import { YAML_FILENAME, YAML_LINES } from "../constants/yamlContent";
import {
  MarkdownIcon,
  YamlIcon,
  TitleBarIcon,
  TabBarIcon,
  BreadcrumbChevron,
  GitBranchIcon,
} from "./vscode/icons";
import { STATUS_FONT } from "./vscode/colors";
import { TrafficLights } from "./shared";
import { EditorPanel, SpecLineRow, YamlLineRow, StatusBarItem } from "./EditorPanel";

const LINE_HEIGHT = 20;
const VISIBLE_LINES = 24;
const CROSSFADE_FRAMES = 12;
const YAML_SWAP_DELAY = 15;

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

  const yamlSwapStart = YAML_WRITE_START + YAML_SWAP_DELAY;
  const showingYaml = frame >= yamlSwapStart;

  const crossfade = interpolate(
    frame,
    [yamlSwapStart, yamlSwapStart + CROSSFADE_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) },
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
        opacity: entrance,
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
