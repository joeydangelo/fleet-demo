import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { ASK_USER_START, ASK_USER_END } from "../../constants/timing";
import {
  MONO,
  SPRING_BOUNCE,
  AUQ_BG,
  AUQ_BORDER,
  AUQ_TEXT,
  AUQ_DIM,
  AUQ_SELECTED,
  AUQ_TAB_ACTIVE_BORDER,
  AUQ_HOVER,
} from "../../constants/theme";
import { MouseCursor } from "./MouseCursor";
import {
  CURSOR_PATHS,
  PHASE_DURATIONS,
  PHASE_STARTS,
  getHoveredOption,
} from "./cursorPaths";

export const AskUserQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - ASK_USER_START;

  // Determine current phase
  let phase = 0;
  for (let i = PHASE_STARTS.length - 1; i >= 0; i--) {
    if (localFrame >= PHASE_STARTS[i]) {
      phase = i;
      break;
    }
  }

  const phaseLocalFrame = localFrame - PHASE_STARTS[phase];
  const phaseDuration = PHASE_DURATIONS[phase];
  const phaseProgress = phaseLocalFrame / phaseDuration;

  // Interpolate cursor position
  const cursorPath = CURSOR_PATHS[phase];
  let cursorX = cursorPath[0].x;
  let cursorY = cursorPath[0].y;

  for (let i = 0; i < cursorPath.length - 1; i++) {
    const a = cursorPath[i];
    const b = cursorPath[i + 1];
    if (phaseLocalFrame >= a.frame && phaseLocalFrame <= b.frame) {
      const t = (phaseLocalFrame - a.frame) / (b.frame - a.frame);
      const eased = 1 - Math.pow(1 - t, 3);
      cursorX = a.x + (b.x - a.x) * eased;
      cursorY = a.y + (b.y - a.y) * eased;
      break;
    }
    if (phaseLocalFrame > b.frame) {
      cursorX = b.x;
      cursorY = b.y;
    }
  }

  const isSelected = phaseProgress > 0.82;
  const hoveredOption = getHoveredOption(cursorY, phase);

  // Expand/collapse animation using spring for natural easing
  const expandProgress = spring({
    frame: localFrame,
    fps,
    config: SPRING_BOUNCE,
  });
  const collapseProgress = spring({
    frame: frame - (ASK_USER_END - 12),
    fps,
    config: { damping: 20, stiffness: 200 },
    reverse: true,
  });
  const visibility = Math.min(expandProgress, collapseProgress);

  const tabs = ["Algorithm", "Scope", "Submit"];

  // Option row style helper
  const optStyle = (
    optIndex: number,
    isDefaultVisible?: boolean,
  ): React.CSSProperties => ({
    color:
      isSelected && hoveredOption === optIndex
        ? AUQ_SELECTED
        : hoveredOption === optIndex
          ? AUQ_TEXT
          : isDefaultVisible
            ? AUQ_TEXT
            : AUQ_DIM,
    fontWeight:
      hoveredOption === optIndex || (isSelected && hoveredOption === optIndex)
        ? 600
        : 400,
    backgroundColor:
      hoveredOption === optIndex && !isSelected ? AUQ_HOVER : "transparent",
    padding: "3px 6px",
    borderRadius: 3,
    lineHeight: 1.6,
  });

  return (
    <div
      style={{
        backgroundColor: AUQ_BG,
        borderTop: `1px solid ${AUQ_BORDER}`,
        fontFamily: MONO,
        fontSize: 12,
        color: AUQ_TEXT,
        overflow: "hidden",
        maxHeight: interpolate(visibility, [0, 1], [0, 170]),
        opacity: visibility,
        position: "relative",
        paddingTop: interpolate(visibility, [0, 1], [0, 10]),
        paddingBottom: interpolate(visibility, [0, 1], [0, 14]),
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      {/* Mouse cursor */}
      {visibility > 0.8 && <MouseCursor x={cursorX} y={cursorY} />}

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 10,
          fontSize: 11,
          alignItems: "center",
        }}
      >
        <span style={{ color: AUQ_DIM }}>←</span>
        {tabs.map((tab, i) => {
          const isActive = i === phase;
          const isDone = i < phase;
          return (
            <span
              key={tab}
              style={{
                color: isActive ? AUQ_TEXT : isDone ? AUQ_TEXT : AUQ_DIM,
                border: isActive
                  ? `1px solid ${AUQ_TAB_ACTIVE_BORDER}`
                  : "1px solid transparent",
                padding: "2px 8px",
                borderRadius: 4,
                fontWeight: isActive ? 600 : 400,
                backgroundColor: isActive
                  ? "rgba(91,155,245,0.08)"
                  : "transparent",
              }}
            >
              {isDone ? "☑" : phase === 2 && i === 2 ? "✓" : "☐"} {tab}
            </span>
          );
        })}
        <span style={{ color: AUQ_DIM }}>→</span>
      </div>

      <div style={{ height: 110, position: "relative" }}>
      {phase === 0 && (
        <div>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 6,
              fontSize: 12,
              color: AUQ_TEXT,
            }}
          >
            Which rate limiting algorithm should be used?
          </div>
          <div style={{ marginLeft: 2 }}>
            <div style={optStyle(0, true)}>
              {hoveredOption === 0 ? "›" : " "} 1. Sliding window (Recommended)
            </div>
            <div
              style={{
                color: AUQ_DIM,
                marginLeft: 24,
                fontSize: 10,
                lineHeight: 1.4,
                padding: "0 6px 2px",
              }}
            >
              smooth traffic shaping, no burst edge cases at window boundaries
            </div>
            <div style={optStyle(1)}>
              {hoveredOption === 1 ? "›" : " "} 2. Token bucket
            </div>
            <div style={optStyle(2)}>
              {hoveredOption === 2 ? "›" : " "} 3. Fixed window
            </div>
          </div>
        </div>
      )}

      {phase === 1 && (
        <div style={{ opacity: interpolate(phaseLocalFrame, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.ease) }) }}>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 6,
              fontSize: 12,
              color: AUQ_TEXT,
            }}
          >
            How should rate limits be scoped?
          </div>
          <div style={{ marginLeft: 2 }}>
            <div style={optStyle(0, true)}>
              {hoveredOption === 0 ? "›" : " "} 1. Per-user + per-endpoint (Recommended)
            </div>
            <div style={optStyle(1)}>
              {hoveredOption === 1 ? "›" : " "} 2. Global per-endpoint
            </div>
            <div style={optStyle(2)}>
              {hoveredOption === 2 ? "›" : " "} 3. Per API key only
            </div>
          </div>
        </div>
      )}

      {phase === 2 && (
        <div style={{ opacity: interpolate(phaseLocalFrame, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.ease) }) }}>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 6,
              fontSize: 12,
              color: AUQ_TEXT,
            }}
          >
            Review your answers
          </div>
          <div style={{ marginLeft: 8, lineHeight: 1.9, fontSize: 12 }}>
            <div>
              <span style={{ color: AUQ_TEXT }}>● Algorithm →</span>{" "}
              <span style={{ color: AUQ_SELECTED }}>
                Sliding window (Recommended)
              </span>
            </div>
            <div>
              <span style={{ color: AUQ_TEXT }}>● Scope →</span>{" "}
              <span style={{ color: AUQ_SELECTED }}>
                Per-user + per-endpoint (Recommended)
              </span>
            </div>
          </div>
          <div
            style={{
              marginTop: 6,
              marginLeft: 2,
              ...optStyle(0, true),
            }}
          >
            <span
              style={{
                color:
                  isSelected && hoveredOption === 0 ? AUQ_SELECTED : AUQ_TEXT,
                fontWeight: 600,
              }}
            >
              › 1. Submit answers
            </span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
