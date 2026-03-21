import React from "react";
import { useCurrentFrame } from "remotion";
import {
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
  ASK_USER_END,
  SPEC_WRITE_START,
  SPEC_SUMMARY_START,
  TIMER1_START,
} from "../constants/timing";
import { PROMPT_TEXT } from "../constants/prompts";
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
  ScoutRow,
} from "./terminal";
import type { ScoutData } from "./terminal";

const SCOUT_DATA: (ScoutData & { isLast: boolean })[] = [
  { name: "Scout API route handlers and middleware", toolUses: 34, tokens: 71.8, doneFrame: SCOUT1_DONE, isLast: false },
  { name: "Scout existing auth and request pipeline", toolUses: 42, tokens: 82.2, doneFrame: SCOUT2_DONE, isLast: false },
  { name: "Scout Redis config and caching layer", toolUses: 35, tokens: 77.3, doneFrame: SCOUT3_DONE, isLast: true },
];

export function Phase1Content({
  runningSeconds,
  runningTokens,
}: {
  runningSeconds: string | null;
  runningTokens: string | null;
}): React.ReactElement {
  const frame = useCurrentFrame();

  const scoutsDoneCount = SCOUT_DATA.filter((s) => frame >= s.doneFrame).length;
  const allScoutsDone = scoutsDoneCount === SCOUT_DATA.length;

  return (
    <>
      <PromptLine text={PROMPT_TEXT} />

      <FadeIn start={SKILL_START} style={{ marginBottom: 4 }}>
        <ToolHeader label="Skill(orchestrator)" />
        {frame >= SKILL_START + 12 && (
          <SubLine>Successfully loaded skill · 1 tool allowed</SubLine>
        )}
      </FadeIn>

      <ToolStep label="Bash(fleet shortcut assess-work)" start={BASH_ASSESS_START} collapsedLines={67} />
      <ToolStep label="Bash(fleet guidelines codebase-research)" start={BASH_GUIDELINES_START} collapsedLines={30} />

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

      <ToolStep label="Bash(fleet shortcut write-spec)" start={BASH_WRITESPEC_START} collapsedLines={67} />
      <ToolStep label="Bash(fleet guidelines spec-design)" start={BASH_SPECDESIGN_START} collapsedLines={44} />
      <ToolStep label="Bash(fleet template plan-spec)" start={BASH_TEMPLATE_START} collapsedLines={37} />

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
            └ · Algorithm →{" "}
            <span style={{ color: GREEN }}>Sliding window (Recommended)</span>
          </div>
          <div>
            └ · Scope →{" "}
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
    </>
  );
}
