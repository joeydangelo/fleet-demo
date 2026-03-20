import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import {
  PROMPT_START,
  PROMPT_TEXT,
  SUBMIT_FRAME,
  ASK_USER_START,
  ASK_USER_END,
  SECOND_PROMPT_TEXT,
  SECOND_PROMPT_START,
  SECOND_PROMPT_SUBMIT,
  THIRD_PROMPT_TEXT,
  THIRD_PROMPT_START,
  THIRD_PROMPT_SUBMIT,
  FLEETGO_BACKGROUND,
} from "../constants/timing";
import { MONO } from "../constants/theme";
import { TerminalContent } from "./TerminalContent";
import { AskUserQuestion } from "./AskUserQuestion";
import { InputCursor } from "./InputCursor";

const INPUT_TEXT_STYLE: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 13,
  color: "#3d3d3d",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

function getInputContent(
  promptVisible: boolean,
  submitted: boolean,
  secondPromptActive: boolean,
  thirdPromptActive: boolean,
): React.ReactNode {
  if (promptVisible && !submitted) {
    return (
      <span style={INPUT_TEXT_STYLE}>
        {PROMPT_TEXT}
        <InputCursor />
      </span>
    );
  }
  if (secondPromptActive) {
    return (
      <span style={INPUT_TEXT_STYLE}>
        {SECOND_PROMPT_TEXT}
        <InputCursor />
      </span>
    );
  }
  if (thirdPromptActive) {
    return (
      <span style={INPUT_TEXT_STYLE}>
        {THIRD_PROMPT_TEXT}
        <InputCursor />
      </span>
    );
  }
  return (
    <span style={{ fontFamily: MONO, fontSize: 14, color: "#999" }}>
      {">"} type a message or /help
    </span>
  );
}

export const MacTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const promptVisible = frame >= PROMPT_START;
  const submitted = frame >= SUBMIT_FRAME;

  const secondPromptActive =
    frame >= SECOND_PROMPT_START && frame < SECOND_PROMPT_SUBMIT;
  const thirdPromptActive =
    frame >= THIRD_PROMPT_START && frame < THIRD_PROMPT_SUBMIT;

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
          fleet
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#faf9f7",
          padding: 20,
          fontFamily: MONO,
          fontSize: 13,
          lineHeight: 1.6,
          color: "#3d3d3d",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <TerminalContent />
      </div>

      {/* Bottom area */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {/* Input box */}
        <div
          style={{
            backgroundColor: "#faf9f7",
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <div
            style={{
              borderTop: "1px solid #c8c4be",
              borderBottom: "1px solid #c8c4be",
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            {getInputContent(promptVisible, submitted, secondPromptActive, thirdPromptActive)}
          </div>
        </div>

        {/* Status bar */}
        <div
          style={{
            backgroundColor: "#faf9f7",
            display: "flex",
            alignItems: "center",
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 6,
            paddingBottom: 10,
            fontFamily: MONO,
            fontSize: 11,
            color: "#888",
          }}
        >
          <span style={{ whiteSpace: "pre" }}>
            <span style={{ color: "#FF6D84" }}>⏵⏵ bypass permissions on</span>
            {frame >= FLEETGO_BACKGROUND && (() => {
              const bashSpring = spring({
                frame: frame - FLEETGO_BACKGROUND,
                fps,
                config: { damping: 18, stiffness: 120, mass: 0.8 },
              });
              return (
                <span
                  style={{
                    display: "inline-block",
                    opacity: bashSpring,
                    transform: `translateX(${interpolate(bashSpring, [0, 1], [8, 0])}px)`,
                  }}
                >
                  <span> · </span>
                  <span style={{ color: "#56b6c2" }}>1 bash</span>
                  <span> · ↓ to manage · esc to interrupt</span>
                </span>
              );
            })()}
          </span>
        </div>

        {/* AUQ overlay */}
        {frame >= ASK_USER_START && frame < ASK_USER_END + 15 && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <AskUserQuestion />
          </div>
        )}
      </div>
    </div>
  );
};
