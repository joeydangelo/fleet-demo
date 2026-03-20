import React from "react";
import { useCurrentFrame } from "remotion";
import {
  PROMPT_TEXT,
  SUBMIT_FRAME,
  SKILL_START,
  BASH_ASSESS_START,
  BASH_GUIDELINES_START,
  SCOUTS_START,
  SCOUT1_DONE,
  SCOUT2_DONE,
  SCOUT3_DONE,
  ASSESSMENT_START,
  BASH_WRITESPEC_START,
  BASH_SPECDESIGN_START,
  BASH_TEMPLATE_START,
  ASK_USER_START,
  ASK_USER_END,
  SPEC_WRITE_START,
  SPEC_SUMMARY_START,
  TIMER1_START,
  SECOND_PROMPT_TEXT,
  SECOND_PROMPT_SUBMIT,
  BASH_DECOMPOSE_START,
  BASH_TASKSPLIT_START,
  BASH_FLEETYAML_START,
  YAML_WRITE_START,
  FINAL_SUMMARY_START,
  TIMER2_START,
  THIRD_PROMPT_TEXT,
  THIRD_PROMPT_SUBMIT,
  FLEETGO_BACKGROUND,
} from "../constants/timing";
import { GREEN, GRAY, DIM, TEXT, TOOL_INDENT } from "../constants/theme";
import {
  Dot,
  BlinkingDot,
  SubLine,
  StatusLine,
  FadeIn,
  ToolHeader,
  SummaryBlock,
  SummaryParagraph,
  CrunchedTimer,
} from "./shared";
import {
  ToolStep,
  PromptLine,
  useElapsedSeconds,
  useTokenCounter,
  useTerminalScroll,
  ScoutRow,
  FleetGoBlock,
} from "./terminal";
import type { ScoutData } from "./terminal";

// Static token rate segments — no deps, so hoisted to module level
const PHASE1_SEGMENTS = [
  { startFrame: SKILL_START, endFrame: ASK_USER_START, rate: 420 },
  { startFrame: ASK_USER_START, endFrame: ASK_USER_END, rate: 40 },
  { startFrame: ASK_USER_END, endFrame: Infinity, rate: 420 },
];

const PHASE2_SEGMENTS = [
  { startFrame: SECOND_PROMPT_SUBMIT, endFrame: Infinity, rate: 480 },
];

const PHASE3_SEGMENTS = [
  { startFrame: THIRD_PROMPT_SUBMIT, endFrame: Infinity, rate: 3 },
];

const SCOUT_DATA: (ScoutData & { isLast: boolean })[] = [
  { name: "Scout API route handlers and middleware", toolUses: 34, tokens: "71.8k", doneFrame: SCOUT1_DONE, isLast: false },
  { name: "Scout existing auth and request pipeline", toolUses: 42, tokens: "82.2k", doneFrame: SCOUT2_DONE, isLast: false },
  { name: "Scout Redis config and caching layer", toolUses: 35, tokens: "77.3k", doneFrame: SCOUT3_DONE, isLast: true },
];

export const TerminalContent: React.FC = () => {
  const frame = useCurrentFrame();

  const submitted = frame >= SUBMIT_FRAME;

  const runningSeconds = useElapsedSeconds(SKILL_START);
  const runningTokens = useTokenCounter(SKILL_START, PHASE1_SEGMENTS);

  const phase2Seconds = useElapsedSeconds(SECOND_PROMPT_SUBMIT);
  const phase2Tokens = useTokenCounter(SECOND_PROMPT_SUBMIT, PHASE2_SEGMENTS);

  const phase3Seconds = useElapsedSeconds(THIRD_PROMPT_SUBMIT);
  const phase3Tokens = useTokenCounter(THIRD_PROMPT_SUBMIT, PHASE3_SEGMENTS, 105);

  const scrollOffset = useTerminalScroll();

  if (!submitted) return null;

  const scoutsDoneCount = SCOUT_DATA.filter((s) => frame >= s.doneFrame).length;
  const allScoutsDone = scoutsDoneCount === 3;

  return (
    <div style={{ transform: `translateY(-${scrollOffset}px)` }}>
      {/* Phase 1: Assess + spec */}
      <PromptLine text={PROMPT_TEXT} />

      <FadeIn start={SKILL_START} style={{ marginBottom: 4 }}>
        <ToolHeader label="Skill(orchestrator)" />
        {frame >= SKILL_START + 12 && (
          <SubLine>Successfully loaded skill · 1 tool allowed</SubLine>
        )}
      </FadeIn>

      <ToolStep label="Bash(assess-work)" start={BASH_ASSESS_START} collapsedLines={67} />
      <ToolStep label="Bash(codebase-research)" start={BASH_GUIDELINES_START} collapsedLines={30} />

      {frame >= SCOUTS_START && (
        <div style={{ marginBottom: 4, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {allScoutsDone ? <Dot color={GREEN} /> : <BlinkingDot color={GREEN} />}
            <span
              style={{
                color: TEXT,
                fontSize: 13,
                fontWeight: allScoutsDone ? 600 : 400,
              }}
            >
              {allScoutsDone
                ? "3 Explore agents finished"
                : "Running 3 Explore agents…"}{" "}
              <span style={{ color: DIM, fontWeight: 400 }}>
                (ctrl+o to expand)
              </span>
            </span>
          </div>

          <div
            style={{
              paddingLeft: TOOL_INDENT,
              fontSize: 12,
              lineHeight: 1.5,
              marginTop: 4,
            }}
          >
            {SCOUT_DATA.map((scout) => (
              <ScoutRow
                key={scout.name}
                startFrame={SCOUTS_START}
                {...scout}
              />
            ))}
          </div>
        </div>
      )}

      <FadeIn
        start={ASSESSMENT_START}
        style={{ marginBottom: 4, marginTop: 12 }}
      >
        <ToolHeader label="Assessment" />
        {frame >= ASSESSMENT_START + 12 && (
          <SummaryBlock>
            <SummaryParagraph>
              Found 14 route handlers across 3 routers, Redis already in
              deps. Auth middleware extracts user context — ideal hook
              point for per-user tracking.
            </SummaryParagraph>
          </SummaryBlock>
        )}
      </FadeIn>

      <ToolStep label="Bash(write-spec)" start={BASH_WRITESPEC_START} collapsedLines={67} />
      <ToolStep label="Bash(spec-design)" start={BASH_SPECDESIGN_START} collapsedLines={44} />
      <ToolStep label="Bash(template plan-spec)" start={BASH_TEMPLATE_START} collapsedLines={37} />

      <FadeIn start={ASK_USER_END} style={{ marginBottom: 4, marginTop: 12 }}>
        <ToolHeader label="User answered Claude's questions:" />
        <div
          style={{
            paddingLeft: TOOL_INDENT,
            fontSize: 12,
            color: GRAY,
            lineHeight: 1.8,
          }}
        >
          <div>
            ⎿ · Algorithm →{" "}
            <span style={{ color: GREEN }}>Sliding window (Recommended)</span>
          </div>
          <div>
            {"  "}· Scope →{" "}
            <span style={{ color: GREEN }}>Per-user + per-endpoint (Recommended)</span>
          </div>
        </div>
      </FadeIn>

      <FadeIn
        start={SPEC_WRITE_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <ToolHeader label="Write(.fleet/specs/spec-2026-03-20-rate-limiting.md)" />
        <SubLine>Wrote 198 lines</SubLine>
      </FadeIn>

      <FadeIn
        start={SPEC_SUMMARY_START}
        style={{ marginBottom: 4, marginTop: 12 }}
      >
        <SummaryBlock>
          <SummaryParagraph>
            Sliding window per-user, per-endpoint across all 14 routes.
            Single middleware after auth — no per-handler wiring.
          </SummaryParagraph>
          <SummaryParagraph>
            Redis failure → fail open. 429 + Retry-After when exceeded.
            X-RateLimit-* headers on every response.
          </SummaryParagraph>
          <SummaryParagraph>
            Want me to proceed to task decomposition, or adjust the spec?
          </SummaryParagraph>
        </SummaryBlock>
      </FadeIn>

      <FadeIn start={TIMER1_START} style={{ marginTop: 12 }}>
        <CrunchedTimer duration="3m 38s" />
      </FadeIn>

      {frame >= SKILL_START + 20 &&
        frame < TIMER1_START &&
        runningSeconds &&
        runningTokens && (
          <div style={{ marginTop: 8 }}>
            <StatusLine seconds={runningSeconds} tokens={runningTokens} />
          </div>
        )}

      {/* Phase 2: Decompose */}
      {frame >= SECOND_PROMPT_SUBMIT && (
        <div style={{ marginTop: 16 }}>
          <PromptLine text={SECOND_PROMPT_TEXT} />
        </div>
      )}

      <ToolStep label="Bash(decompose-work)" start={BASH_DECOMPOSE_START} collapsedLines={57} />
      <ToolStep label="Bash(task-splitting)" start={BASH_TASKSPLIT_START} collapsedLines={38} />
      <ToolStep label="Bash(fleet-yaml)" start={BASH_FLEETYAML_START} collapsedLines={56} />

      <FadeIn
        start={YAML_WRITE_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <ToolHeader label="Write(.fleet/fleet.yaml)" />
        <SubLine>Wrote 46 lines</SubLine>
      </FadeIn>

      <FadeIn
        start={FINAL_SUMMARY_START}
        style={{ marginBottom: 4, marginTop: 12 }}
      >
        <SummaryBlock>
          <SummaryParagraph>
            Two parallel tasks — middleware owns the sliding window limiter
            and Redis layer, config owns route-level limit definitions and
            response headers.
          </SummaryParagraph>
          <SummaryParagraph>
            Ready to run fleet go to launch the builders. Want me to kick
            it off?
          </SummaryParagraph>
        </SummaryBlock>
      </FadeIn>

      <FadeIn start={TIMER2_START} style={{ marginTop: 12 }}>
        <CrunchedTimer duration="5m 52s" />
      </FadeIn>

      {frame >= SECOND_PROMPT_SUBMIT + 15 &&
        frame < TIMER2_START &&
        phase2Seconds &&
        phase2Tokens && (
          <div style={{ marginTop: 8 }}>
            <StatusLine seconds={phase2Seconds} tokens={phase2Tokens} />
          </div>
        )}

      {/* Phase 3: Fleet go */}
      {frame >= THIRD_PROMPT_SUBMIT && (
        <div style={{ marginTop: 16 }}>
          <PromptLine text={THIRD_PROMPT_TEXT} />
        </div>
      )}

      <FleetGoBlock />

      {frame >= FLEETGO_BACKGROUND + 10 &&
        phase3Seconds &&
        phase3Tokens && (
          <div style={{ marginTop: 8 }}>
            <StatusLine
              seconds={phase3Seconds}
              tokens={phase3Tokens}
              tokenDirection="↓"
            />
          </div>
        )}
    </div>
  );
};
