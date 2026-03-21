import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import {
  PROMPT_START,
  SUBMIT_FRAME,
  ASK_USER_START,
  ASK_USER_END,
  SECOND_PROMPT_START,
  SECOND_PROMPT_SUBMIT,
  THIRD_PROMPT_START,
  THIRD_PROMPT_SUBMIT,
  BROADCAST_PROMPT_START,
  BROADCAST_PROMPT_SUBMIT,
  FLEETGO_BACKGROUND,
  BG_COMPLETE,
} from "../constants/timing";
import {
  PROMPT_TEXT,
  SECOND_PROMPT_TEXT,
  THIRD_PROMPT_TEXT,
  BROADCAST_PROMPT_TEXT,
} from "../constants/prompts";
import { MONO, TEXT, GRAY, SYSTEM_FONT, SPRING_BOUNCE } from "../constants/theme";
import { TrafficLights } from "./shared";
import { TerminalContent } from "./TerminalContent";
import { AskUserQuestion } from "./AskUserQuestion";
import { InputCursor } from "./InputCursor";

const INPUT_TEXT_STYLE: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 13,
  color: TEXT,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

type PromptState = "initial" | "first" | "second" | "third" | "broadcast";

function getPromptState(
  frame: number,
): PromptState {
  if (frame >= BROADCAST_PROMPT_START && frame < BROADCAST_PROMPT_SUBMIT) return "broadcast";
  if (frame >= THIRD_PROMPT_START && frame < THIRD_PROMPT_SUBMIT) return "third";
  if (frame >= SECOND_PROMPT_START && frame < SECOND_PROMPT_SUBMIT) return "second";
  if (frame >= PROMPT_START && frame < SUBMIT_FRAME) return "first";
  return "initial";
}

const PROMPT_TEXTS: Record<Exclude<PromptState, "initial">, string> = {
  first: PROMPT_TEXT,
  second: SECOND_PROMPT_TEXT,
  third: THIRD_PROMPT_TEXT,
  broadcast: BROADCAST_PROMPT_TEXT,
};

function TerminalInput({ state }: { state: PromptState }): React.ReactElement {
  if (state === "initial") {
    return (
      <span style={{ fontFamily: MONO, fontSize: 14, color: GRAY }}>
        {">"} type a message or /help
      </span>
    );
  }
  return (
    <span style={INPUT_TEXT_STYLE}>
      {PROMPT_TEXTS[state]}
      <InputCursor />
    </span>
  );
}

function BashStatusBadge(): React.ReactElement {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bashSpring = spring({
    frame: frame - FLEETGO_BACKGROUND,
    fps,
    config: SPRING_BOUNCE,
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
}

export const FleetCli: React.FC = () => {
  const frame = useCurrentFrame();
  const promptState = getPromptState(frame);

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
        <TrafficLights />
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "#6b6560",
            fontSize: 13,
            fontFamily: SYSTEM_FONT,
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
          color: TEXT,
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
            <TerminalInput state={promptState} />
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
            <span style={{ color: "#FF6D84" }}>▶▶ bypass permissions on</span>
            {frame >= FLEETGO_BACKGROUND && frame < BG_COMPLETE && <BashStatusBadge />}
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
