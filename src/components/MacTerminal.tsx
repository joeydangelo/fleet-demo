import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import {
  PROMPT_START,
  PROMPT_TEXT,
  SUBMIT_FRAME,
  ASK_USER_START,
  ASK_USER_END,
} from "../constants/timing";
import { MONO } from "../constants/theme";
import { TerminalContent } from "./TerminalContent";
import { AskUserQuestion } from "./AskUserQuestion";
import { InputCursor } from "./InputCursor";

export const MacTerminal: React.FC = () => {
  const frame = useCurrentFrame();

  const promptVisible = frame >= PROMPT_START;
  const submitted = frame >= SUBMIT_FRAME;

  const askActive = frame >= ASK_USER_START && frame < ASK_USER_END;

  // Smooth fade for input box around AUQ transitions
  const inputBoxOpacity =
    frame >= ASK_USER_START - 10 && frame < ASK_USER_START
      ? interpolate(frame, [ASK_USER_START - 10, ASK_USER_START], [1, 0], {
          extrapolateRight: "clamp",
        })
      : frame >= ASK_USER_END && frame < ASK_USER_END + 10
        ? interpolate(frame, [ASK_USER_END, ASK_USER_END + 10], [0, 1], {
            extrapolateLeft: "clamp",
          })
        : askActive
          ? 0
          : 1;

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
      {askActive ? (
        <AskUserQuestion />
      ) : (
        <div
          style={{
            backgroundColor: "#faf9f7",
            flexShrink: 0,
            paddingLeft: 20,
            paddingRight: 20,
            opacity: inputBoxOpacity,
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
            {promptVisible && !submitted ? (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: "#3d3d3d",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {PROMPT_TEXT}
                <InputCursor />
              </span>
            ) : (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 14,
                  color: "#999",
                }}
              >
                {">"} type a message or /help
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
