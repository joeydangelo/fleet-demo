import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
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
  TIMER_START,
} from "../constants/timing";
import { GREEN, BLUE, GRAY, DIM, TEXT, BOLD_TEXT } from "../constants/theme";
import {
  Dot,
  CollapsedOutput,
  SubLine,
  StatusLine,
  FadeIn,
  ScoutRow,
} from "./shared";

export const TerminalContent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const submitted = frame >= SUBMIT_FRAME;

  const runningSeconds = useMemo(() => {
    if (frame < SKILL_START) return null;
    const elapsed = Math.floor((frame - SKILL_START) / fps);
    return `${elapsed}s`;
  }, [frame, fps]);

  const runningTokens = useMemo(() => {
    if (frame < SKILL_START) return null;
    const elapsed = (frame - SKILL_START) / fps;
    const tokens = Math.floor(elapsed * 420);
    if (tokens > 1000) return `${(tokens / 1000).toFixed(1)}k`;
    return `${tokens}`;
  }, [frame, fps]);

  const scrollOffset = useMemo(() => {
    if (frame < ASSESSMENT_START) return 0;
    if (frame < BASH_WRITESPEC_START) {
      return interpolate(
        frame,
        [ASSESSMENT_START, ASSESSMENT_START + 30],
        [0, 100],
        { extrapolateRight: "clamp" },
      );
    }
    return interpolate(
      frame,
      [BASH_WRITESPEC_START, BASH_TEMPLATE_START + 20],
      [100, 260],
      { extrapolateRight: "clamp" },
    );
  }, [frame]);

  if (!submitted) return null;

  // How many scouts are done
  const scoutsDoneCount =
    (frame >= SCOUT1_DONE ? 1 : 0) +
    (frame >= SCOUT2_DONE ? 1 : 0) +
    (frame >= SCOUT3_DONE ? 1 : 0);
  const allScoutsDone = scoutsDoneCount === 3;

  return (
    <div style={{ transform: `translateY(-${scrollOffset}px)` }}>
      {/* Submitted prompt */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: BLUE, marginRight: 8, fontWeight: 700 }}>
            ❯
          </span>
          <span style={{ color: TEXT, whiteSpace: "pre-wrap" }}>
            {PROMPT_TEXT}
          </span>
        </div>
      </div>

      {/* Skill(orchestrator) */}
      <FadeIn start={SKILL_START} style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Skill(orchestrator)
          </span>
        </div>
        {frame >= SKILL_START + 12 && (
          <SubLine>Successfully loaded skill · 1 tool allowed</SubLine>
        )}
      </FadeIn>

      {/* Bash(fleet shortcut assess-work) */}
      <FadeIn
        start={BASH_ASSESS_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Bash(assess-work)
          </span>
        </div>
        {frame >= BASH_ASSESS_START + 10 && <CollapsedOutput lines={67} />}
      </FadeIn>

      {/* Bash(fleet guidelines codebase-research) */}
      <FadeIn
        start={BASH_GUIDELINES_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Bash(codebase-research)
          </span>
        </div>
        {frame >= BASH_GUIDELINES_START + 10 && (
          <CollapsedOutput lines={30} />
        )}
      </FadeIn>

      {/* Explore agents — staggered completion */}
      {frame >= SCOUTS_START && (
        <div style={{ marginBottom: 4, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Dot color={allScoutsDone ? GREEN : BLUE} />
            <span
              style={{
                color: TEXT,
                fontSize: 13,
                fontWeight: allScoutsDone ? 600 : 400,
              }}
            >
              {allScoutsDone
                ? `3 Explore agents finished`
                : `Running 3 Explore agents…`}{" "}
              <span style={{ color: DIM, fontWeight: 400 }}>
                (ctrl+o to expand)
              </span>
            </span>
          </div>

          {/* Individual agent rows */}
          <div
            style={{
              paddingLeft: 22,
              fontSize: 12,
              lineHeight: 1.5,
              marginTop: 4,
            }}
          >
            <ScoutRow
              name="Scout API route handlers and middleware"
              toolUses={34}
              tokens="71.8k"
              startFrame={SCOUTS_START}
              doneFrame={SCOUT1_DONE}
              isLast={false}
            />
            <ScoutRow
              name="Scout existing auth and request pipeline"
              toolUses={42}
              tokens="82.2k"
              startFrame={SCOUTS_START}
              doneFrame={SCOUT2_DONE}
              isLast={false}
            />
            <ScoutRow
              name="Scout Redis config and caching layer"
              toolUses={35}
              tokens="77.3k"
              startFrame={SCOUTS_START}
              doneFrame={SCOUT3_DONE}
              isLast={true}
            />
          </div>
        </div>
      )}

      {/* Assessment */}
      <FadeIn
        start={ASSESSMENT_START}
        style={{ marginBottom: 4, marginTop: 12 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Assessment
          </span>
        </div>
        {frame >= ASSESSMENT_START + 12 && (
          <div
            style={{
              paddingLeft: 22,
              fontSize: 12,
              color: TEXT,
              lineHeight: 1.7,
              maxWidth: 440,
            }}
          >
            <p style={{ margin: "4px 0" }}>
              Found 14 route handlers across 3 routers, Redis already in
              deps. Auth middleware extracts user context — ideal hook
              point for per-user tracking.
            </p>
          </div>
        )}
      </FadeIn>

      {/* Bash(fleet shortcut write-spec) */}
      <FadeIn
        start={BASH_WRITESPEC_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Bash(write-spec)
          </span>
        </div>
        {frame >= BASH_WRITESPEC_START + 10 && (
          <CollapsedOutput lines={67} />
        )}
      </FadeIn>

      {/* Bash(fleet guidelines spec-design) */}
      <FadeIn
        start={BASH_SPECDESIGN_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Bash(spec-design)
          </span>
        </div>
        {frame >= BASH_SPECDESIGN_START + 10 && (
          <CollapsedOutput lines={44} />
        )}
      </FadeIn>

      {/* Bash(fleet template plan-spec) */}
      <FadeIn
        start={BASH_TEMPLATE_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Bash(template plan-spec)
          </span>
        </div>
        {frame >= BASH_TEMPLATE_START + 10 && (
          <CollapsedOutput lines={37} />
        )}
      </FadeIn>

      {/* User answered Claude's questions */}
      <FadeIn start={ASK_USER_END} style={{ marginBottom: 4, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            User answered Claude's questions:
          </span>
        </div>
        <div
          style={{
            paddingLeft: 22,
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

      {/* Write spec */}
      <FadeIn
        start={SPEC_WRITE_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Write(.fleet/specs/spec-2026-03-20-rate-limiting.md)
          </span>
        </div>
        <SubLine>Wrote 198 lines</SubLine>
      </FadeIn>


      {/* Timer */}
      <FadeIn start={TIMER_START} style={{ marginTop: 12 }}>
        <StatusLine
          seconds="3m 38s"
          tokens="231.3k"
          label="Crunched for 3m 38s"
        />
      </FadeIn>

      {/* Running status */}
      {frame >= SKILL_START + 20 &&
        frame < TIMER_START &&
        runningSeconds &&
        runningTokens && (
          <div style={{ marginTop: 8 }}>
            <StatusLine seconds={runningSeconds} tokens={runningTokens} />
          </div>
        )}
    </div>
  );
};
