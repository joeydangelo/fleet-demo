import React from "react";
import { useCurrentFrame } from "remotion";
import {
  SUBMIT_FRAME,
  SKILL_START,
  ASK_USER_START,
  ASK_USER_END,
  SECOND_PROMPT_SUBMIT,
  FLEETGO_BACKGROUND,
  DASH_INK_START,
} from "../constants/timing";
import {
  useElapsedSeconds,
  useTokenCounter,
  useTerminalScroll,
} from "./terminal";
import { ScoutPhaseContent } from "./ScoutPhaseContent";
import { SpecPhaseContent } from "./SpecPhaseContent";
import { FleetGoPhaseContent } from "./FleetGoPhaseContent";

// Static token rate segments
const PHASE1_SEGMENTS = [
  { startFrame: SKILL_START, endFrame: ASK_USER_START, rate: 420 },
  { startFrame: ASK_USER_START, endFrame: ASK_USER_END, rate: 40 },
  { startFrame: ASK_USER_END, endFrame: Infinity, rate: 420 },
];

const PHASE2_SEGMENTS = [
  { startFrame: SECOND_PROMPT_SUBMIT, endFrame: Infinity, rate: 480 },
];

const PHASE3_SEGMENTS = [
  { startFrame: FLEETGO_BACKGROUND, endFrame: Infinity, rate: 3 },
];

export const TerminalContent: React.FC = () => {
  const frame = useCurrentFrame();

  const submitted = frame >= SUBMIT_FRAME;

  const runningSeconds = useElapsedSeconds(SKILL_START);
  const runningTokens = useTokenCounter(SKILL_START, PHASE1_SEGMENTS);

  const phase2Seconds = useElapsedSeconds(SECOND_PROMPT_SUBMIT);
  const phase2Tokens = useTokenCounter(SECOND_PROMPT_SUBMIT, PHASE2_SEGMENTS);

  const phase3Seconds = useElapsedSeconds(FLEETGO_BACKGROUND, [
    { until: FLEETGO_BACKGROUND + DASH_INK_START, speed: 1 },
    { until: Infinity, speed: 15 },
  ], 30);
  const phase3Tokens = useTokenCounter(FLEETGO_BACKGROUND, PHASE3_SEGMENTS, 105);

  const scrollOffset = useTerminalScroll();

  if (!submitted) return null;

  return (
    <div style={{ transform: `translateY(-${scrollOffset}px)` }}>
      <ScoutPhaseContent runningSeconds={runningSeconds} runningTokens={runningTokens} />
      <SpecPhaseContent phase2Seconds={phase2Seconds} phase2Tokens={phase2Tokens} />
      <FleetGoPhaseContent phase3Seconds={phase3Seconds} phase3Tokens={phase3Tokens} />
    </div>
  );
};
