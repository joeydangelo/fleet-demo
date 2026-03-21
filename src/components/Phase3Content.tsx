import React from "react";
import { useCurrentFrame } from "remotion";
import {
  THIRD_PROMPT_SUBMIT,
  FLEETGO_BACKGROUND,
  FLEETGO_COMPLETE,
  BROADCAST_PROMPT_SUBMIT,
  BROADCAST_RESPONSE_START,
  BASH_GITLOG_START,
  BASH_TEST_START,
  FINAL_MESSAGE_START,
  TIMER3_START,
  BG_COMPLETE,
} from "../constants/timing";
import { THIRD_PROMPT_TEXT, BROADCAST_PROMPT_TEXT } from "../constants/prompts";
import { GREEN, GRAY, DIM, TEXT, TOOL_INDENT, ORANGE } from "../constants/theme";
import {
  StatusLine,
  FadeIn,
  ToolHeader,
  SummaryBlock,
  SummaryParagraph,
  CrunchedTimer,
} from "./shared";
import { PromptLine, FleetGoBlock } from "./terminal";

export function Phase3Content({
  phase3Seconds,
  phase3Tokens,
}: {
  phase3Seconds: string | null;
  phase3Tokens: string | null;
}): React.ReactElement | null {
  const frame = useCurrentFrame();

  if (frame < THIRD_PROMPT_SUBMIT) return null;

  return (
    <>
      <div style={{ marginTop: 16 }}>
        <PromptLine text={THIRD_PROMPT_TEXT} />
      </div>

      <FleetGoBlock />

      {frame >= FLEETGO_BACKGROUND + 10 &&
        frame < FLEETGO_COMPLETE &&
        phase3Seconds &&
        phase3Tokens && (
          <div style={{ marginTop: 8 }}>
            <StatusLine
              seconds={phase3Seconds}
              tokens={phase3Tokens}
              label="Scurrying…"
              tokenDirection="↓"
            />
          </div>
        )}

      {/* Broadcast prompt — user messages agents mid-build */}
      {frame >= BROADCAST_PROMPT_SUBMIT && (
        <div style={{ marginTop: 16 }}>
          <PromptLine text={BROADCAST_PROMPT_TEXT} />
        </div>
      )}

      <FadeIn
        start={BROADCAST_RESPONSE_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <ToolHeader label="Bash(fleet broadcast)" />
        {frame >= BROADCAST_RESPONSE_START + 10 && (
          <SummaryBlock>
            <SummaryParagraph>
              done. they left it on read and kept shipping. Doug could never.
            </SummaryParagraph>
          </SummaryBlock>
        )}
      </FadeIn>

      {/* Completion cascade */}
      <FadeIn
        start={FLEETGO_COMPLETE}
        style={{ marginBottom: 4, marginTop: 12 }}
      >
        <ToolHeader label="fleet go completed successfully" />
        {frame >= FLEETGO_COMPLETE + 12 && (
          <SummaryBlock>
            <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.8 }}>
              <div>- up — created worktrees and branches</div>
              <div>- launch — spawned 2 builder agents</div>
              <FadeIn start={FLEETGO_COMPLETE + 18} style={{}}>
                <div>- watch — agents committed, submitted for review</div>
                <div>- merge — merged clean into feat/rate-limiting</div>
              </FadeIn>
              <FadeIn start={FLEETGO_COMPLETE + 24} style={{}}>
                <div>- down — cleaned up worktrees, archived sessions</div>
              </FadeIn>
            </div>
          </SummaryBlock>
        )}
      </FadeIn>

      <FadeIn start={BASH_GITLOG_START} style={{ marginBottom: 4, marginTop: 8 }}>
        <ToolHeader label="Bash(git log --oneline feat/rate-limiting ^main)" />
        {frame >= BASH_GITLOG_START + 10 && (
          <div style={{ paddingLeft: TOOL_INDENT, fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ color: DIM }}>
              └ <span style={{ color: ORANGE }}>a3f1c92</span>{" "}
              <span style={{ color: TEXT }}>feat: add sliding-window rate limiter middleware</span>
            </div>
            <div style={{ color: DIM }}>
              └ <span style={{ color: ORANGE }}>e7d4a18</span>{" "}
              <span style={{ color: TEXT }}>feat: add per-route rate limit config and headers</span>
            </div>
          </div>
        )}
      </FadeIn>

      <FadeIn start={BASH_TEST_START} style={{ marginBottom: 4, marginTop: 8 }}>
        <ToolHeader label="Bash(pnpm vitest run tests/rate-limit.test.ts)" />
        {frame >= BASH_TEST_START + 10 && (
          <div style={{ paddingLeft: TOOL_INDENT, fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ color: DIM }}>
              └ <span style={{ color: GREEN }}>✓</span>{" "}
              <span style={{ color: GRAY }}>tests/rate-limit.test.ts (18 tests) 412ms</span>
            </div>
          </div>
        )}
      </FadeIn>

      <FadeIn
        start={FINAL_MESSAGE_START}
        style={{ marginBottom: 4, marginTop: 12 }}
      >
        <SummaryBlock>
          <SummaryParagraph>
            All 18 tests pass. Both tasks merged into feat/rate-limiting —
            middleware handles sliding window + Redis, config wires per-route
            limits and response headers.
          </SummaryParagraph>
          <SummaryParagraph>
            Ready for fleet finish-branch to integrate into main.
          </SummaryParagraph>
        </SummaryBlock>
      </FadeIn>

      <FadeIn start={TIMER3_START} style={{ marginTop: 12 }}>
        <CrunchedTimer duration="13m 35s" />
      </FadeIn>

      <FadeIn start={BG_COMPLETE} style={{ marginTop: 12 }}>
        <ToolHeader label={`Background "fleet go" completed (exit 0)`} />
      </FadeIn>
    </>
  );
}
