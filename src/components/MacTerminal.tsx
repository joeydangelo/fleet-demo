import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FLEETGO_BACKGROUND } from "../constants/timing";
import { MONO, SYSTEM_FONT, SPRING_LAYOUT, SPRING_BOUNCE } from "../constants/theme";
import { TrafficLights } from "./shared";
import { DashboardView } from "./DashboardView";

// macOS Terminal.app dark profile colors
const TERM_BG = "#282828";
const TERM_TEXT = "#cccccc";
const TERM_DIM = "#808080";
const TITLE_BAR_BG = "#3d3d3d";
const TITLE_BAR_TEXT = "#cacaca";
const CURSOR_BLINK_FRAMES = 16;

// Typing timing
const COMMAND_TEXT = "fleet dashboard";
const TYPE_DELAY_SECONDS = 0.7;
const CHAR_FRAMES = 2;
const DASHBOARD_DELAY_FRAMES = 15;

function FolderIcon(): React.ReactElement {
  return (
    <svg
      width="16"
      height="14"
      viewBox="0 0 16 14"
      fill="none"
      style={{ verticalAlign: "middle", marginRight: 5 }}
    >
      <defs>
        <linearGradient id="folderBack" x1="8" y1="0" x2="8" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#68CAFE" />
          <stop offset="100%" stopColor="#3B93D4" />
        </linearGradient>
        <linearGradient id="folderFront" x1="8" y1="3.5" x2="8" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7AD2FF" />
          <stop offset="100%" stopColor="#4AA3E0" />
        </linearGradient>
      </defs>
      <path
        d="M1.5 2C1.5 1.17 2.17 0.5 3 0.5H6.09C6.49 0.5 6.87 0.66 7.15 0.94L8.06 1.85C8.34 2.13 8.72 2.3 9.12 2.3H13C13.83 2.3 14.5 2.97 14.5 3.8V11.5C14.5 12.33 13.83 13 13 13H3C2.17 13 1.5 12.33 1.5 11.5V2Z"
        fill="url(#folderBack)"
      />
      <path
        d="M0.5 5C0.5 4.17 1.17 3.5 2 3.5H14C14.83 3.5 15.5 4.17 15.5 5V11.5C15.5 12.33 14.83 13 14 13H2C1.17 13 0.5 12.33 0.5 11.5V5Z"
        fill="url(#folderFront)"
      />
    </svg>
  );
}

function TerminalCursor(): React.ReactElement {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame % CURSOR_BLINK_FRAMES,
    [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
    [0.8, 0, 0.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 15,
        backgroundColor: TERM_TEXT,
        verticalAlign: "text-bottom",
        marginLeft: 1,
        opacity,
      }}
    />
  );
}

/** Compute the local frame at which typing completes and the dashboard can appear. */
function computeDashboardStart(fps: number): number {
  const typeDelay = Math.round(fps * TYPE_DELAY_SECONDS);
  const typingDuration = COMMAND_TEXT.length * CHAR_FRAMES;
  return typeDelay + typingDuration + DASHBOARD_DELAY_FRAMES;
}

// ── Main components ──────────────────────────────────────────────────

function TerminalPrompt({
  frame,
  fps,
}: {
  frame: number;
  fps: number;
}): React.ReactElement {
  const promptSpring = spring({
    frame,
    fps,
    config: SPRING_BOUNCE,
  });

  const typeDelay = Math.round(fps * TYPE_DELAY_SECONDS);
  const typeFrame = frame - typeDelay;
  const charsTyped = typeFrame > 0
    ? Math.min(Math.floor(typeFrame / CHAR_FRAMES), COMMAND_TEXT.length)
    : 0;
  const typedText = COMMAND_TEXT.slice(0, charsTyped);
  const doneTyping = charsTyped >= COMMAND_TEXT.length;

  const dashboardStart = computeDashboardStart(fps);
  const dashFrame = frame - dashboardStart;
  const showDashboard = dashFrame >= 0;

  // Alternate screen buffer: prompt vanishes once dashboard takes over
  if (showDashboard) {
    return <DashboardView dashFrame={dashFrame} fps={fps} />;
  }

  return (
    <div style={{ opacity: promptSpring }}>
      <div>
        <span style={{ color: TERM_TEXT }}>joey@Joeys-MacBook-Pro fleet</span>
        <span style={{ color: TERM_DIM }}> % </span>
        <span style={{ color: TERM_TEXT }}>{typedText}</span>
        {!doneTyping && <TerminalCursor />}
      </div>
    </div>
  );
}

export const MacTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - FLEETGO_BACKGROUND;
  if (localFrame < 0) return null;

  const entrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_LAYOUT,
  });

  const translateX = interpolate(entrance, [0, 1], [60, 0]);

  return (
    <div
      style={{
        width: 580,
        height: 580,
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 12px 24px -8px rgba(0, 0, 0, 0.25)",
        opacity: entrance,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 28,
          backgroundColor: TITLE_BAR_BG,
          display: "flex",
          alignItems: "center",
          paddingLeft: 10,
          paddingRight: 10,
          flexShrink: 0,
        }}
      >
        <TrafficLights />
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: TITLE_BAR_TEXT,
            fontSize: 13,
            fontFamily: SYSTEM_FONT,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FolderIcon />
          fleet — -zsh — 71×25
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Terminal content */}
      <div
        style={{
          flex: 1,
          backgroundColor: TERM_BG,
          padding: 12,
          paddingTop: 8,
          fontFamily: MONO,
          fontSize: 13,
          lineHeight: 1.6,
          color: TERM_TEXT,
          overflow: "hidden",
        }}
      >
        <TerminalPrompt frame={localFrame} fps={fps} />
      </div>
    </div>
  );
};
