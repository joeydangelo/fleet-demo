import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import {
  BASH_FLEETGO_START,
  FLEETGO_BACKGROUND,
} from "../../constants/timing";
import { DIM, GRAY, TEXT, TOOL_INDENT } from "../../constants/theme";
import { FadeIn, FADE_CLAMP, ToolHeader, SubLine } from "../shared";

export const FleetGoBlock: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <FadeIn
      start={BASH_FLEETGO_START}
      style={{ marginBottom: 4, marginTop: 8 }}
    >
      <ToolHeader label="Bash(fleet go)" />

      {frame < FLEETGO_BACKGROUND && (
        <div
          style={{
            paddingLeft: TOOL_INDENT,
            fontSize: 12,
            lineHeight: 1.7,
            marginTop: 4,
            opacity: interpolate(
              frame,
              [FLEETGO_BACKGROUND - 8, FLEETGO_BACKGROUND],
              [1, 0],
              FADE_CLAMP,
            ),
          }}
        >
          <div style={{ color: DIM }}>
            {"  "}┌{"  "}
            <span style={{ color: TEXT, fontWeight: 600 }}>fleet go</span>
          </div>
          <div style={{ color: DIM }}>
            {"  "}│{"  "}
            <span style={{ color: GRAY }}>
              target: feat/rate-limiting · 3 tasks
            </span>
          </div>
          <FadeIn start={BASH_FLEETGO_START + 18} style={{}}>
            <div style={{ color: DIM }}>
              {"  "}◇{"  "}
              <span style={{ color: TEXT, fontWeight: 600 }}>fleet up</span>
            </div>
            <div style={{ color: DIM }}>
              {"  "}│{"  "}
              <span style={{ color: GRAY }}>middleware · config · api</span>
            </div>
          </FadeIn>
          <FadeIn start={BASH_FLEETGO_START + 36} style={{}}>
            <div style={{ color: DIM }}>
              {"  "}◇{"  "}
              <span style={{ color: TEXT, fontWeight: 600 }}>fleet launch</span>
            </div>
            <div style={{ color: DIM }}>
              {"  "}│{"  "}
              <span style={{ color: GRAY }}>3 agents spawned</span>
            </div>
          </FadeIn>
          <FadeIn start={BASH_FLEETGO_START + 50} style={{}}>
            <div style={{ color: DIM, marginTop: 4 }}>
              {"  "}(ctrl+b to run in background)
            </div>
          </FadeIn>
        </div>
      )}

      {frame >= FLEETGO_BACKGROUND && (
        <div
          style={{
            opacity: interpolate(
              frame,
              [FLEETGO_BACKGROUND, FLEETGO_BACKGROUND + 8],
              [0, 1],
              FADE_CLAMP,
            ),
          }}
        >
          <SubLine>Running in the background (↓ to manage)</SubLine>
        </div>
      )}
    </FadeIn>
  );
};
