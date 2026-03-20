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
} from "../constants/timing";
import { GREEN, BLUE, GRAY, DIM, TEXT, BOLD_TEXT, ORANGE } from "../constants/theme";
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

  const phase2Seconds = useMemo(() => {
    if (frame < SECOND_PROMPT_SUBMIT) return null;
    const elapsed = Math.floor((frame - SECOND_PROMPT_SUBMIT) / fps);
    return `${elapsed}s`;
  }, [frame, fps]);

  const phase2Tokens = useMemo(() => {
    if (frame < SECOND_PROMPT_SUBMIT) return null;
    const elapsed = (frame - SECOND_PROMPT_SUBMIT) / fps;
    const tokens = Math.floor(elapsed * 480);
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
    if (frame < SPEC_SUMMARY_START) {
      return interpolate(
        frame,
        [BASH_WRITESPEC_START, BASH_TEMPLATE_START + 20],
        [100, 260],
        { extrapolateRight: "clamp" },
      );
    }
    if (frame < SECOND_PROMPT_SUBMIT) {
      return interpolate(
        frame,
        [SPEC_SUMMARY_START, TIMER1_START],
        [260, 420],
        { extrapolateRight: "clamp" },
      );
    }
    if (frame < YAML_WRITE_START) {
      return interpolate(
        frame,
        [SECOND_PROMPT_SUBMIT, BASH_FLEETYAML_START],
        [420, 650],
        { extrapolateRight: "clamp" },
      );
    }
    return interpolate(
      frame,
      [YAML_WRITE_START, TIMER2_START],
      [650, 780],
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

      {/* Spec summary */}
      <FadeIn
        start={SPEC_SUMMARY_START}
        style={{ marginBottom: 4, marginTop: 12 }}
      >
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
            Sliding window per-user, per-endpoint across all 14 routes.
            Single middleware after auth — no per-handler wiring.
          </p>
          <p style={{ margin: "4px 0" }}>
            Redis failure → fail open. 429 + Retry-After when exceeded.
            X-RateLimit-* headers on every response.
          </p>
          <p style={{ margin: "4px 0" }}>
            Want me to proceed to task decomposition, or adjust the spec?
          </p>
        </div>
      </FadeIn>

      {/* Timer 1 — static, no animation */}
      <FadeIn start={TIMER1_START} style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: ORANGE, fontSize: 14, marginRight: 6 }}>✻</span>
          <span style={{ color: ORANGE, fontWeight: 600, fontSize: 12 }}>
            Crunched for 3m 38s
          </span>
        </div>
      </FadeIn>

      {/* Phase 1 running status */}
      {frame >= SKILL_START + 20 &&
        frame < TIMER1_START &&
        runningSeconds &&
        runningTokens && (
          <div style={{ marginTop: 8 }}>
            <StatusLine seconds={runningSeconds} tokens={runningTokens} />
          </div>
        )}

      {/* ---- Phase 2: User approves, orchestrator decomposes ---- */}

      {/* Second submitted prompt */}
      {frame >= SECOND_PROMPT_SUBMIT && (
        <div style={{ marginBottom: 12, marginTop: 16 }}>
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
              {SECOND_PROMPT_TEXT}
            </span>
          </div>
        </div>
      )}

      {/* Bash(fleet shortcut decompose-work) */}
      <FadeIn
        start={BASH_DECOMPOSE_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Bash(decompose-work)
          </span>
        </div>
        {frame >= BASH_DECOMPOSE_START + 10 && (
          <CollapsedOutput lines={57} />
        )}
      </FadeIn>

      {/* Bash(fleet guidelines task-splitting) */}
      <FadeIn
        start={BASH_TASKSPLIT_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Bash(task-splitting)
          </span>
        </div>
        {frame >= BASH_TASKSPLIT_START + 10 && (
          <CollapsedOutput lines={38} />
        )}
      </FadeIn>

      {/* Bash(fleet template fleet-yaml) */}
      <FadeIn
        start={BASH_FLEETYAML_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Bash(fleet-yaml)
          </span>
        </div>
        {frame >= BASH_FLEETYAML_START + 10 && (
          <CollapsedOutput lines={56} />
        )}
      </FadeIn>

      {/* Write(.fleet/fleet.yaml) */}
      <FadeIn
        start={YAML_WRITE_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Write(.fleet/fleet.yaml)
          </span>
        </div>
        <SubLine>Wrote 46 lines</SubLine>
      </FadeIn>

      {/* Final summary — decompose result + fleet go prompt */}
      <FadeIn
        start={FINAL_SUMMARY_START}
        style={{ marginBottom: 4, marginTop: 12 }}
      >
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
            Two parallel tasks — middleware owns the sliding window limiter
            and Redis layer, config owns route-level limit definitions and
            response headers.
          </p>
          <p style={{ margin: "4px 0" }}>
            Ready to run fleet go to launch the builders. Want me to kick
            it off?
          </p>
        </div>
      </FadeIn>

      {/* Timer 2 — static, no animation */}
      <FadeIn start={TIMER2_START} style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: ORANGE, fontSize: 14, marginRight: 6 }}>✻</span>
          <span style={{ color: ORANGE, fontWeight: 600, fontSize: 12 }}>
            Crunched for 5m 52s
          </span>
        </div>
      </FadeIn>

      {/* Phase 2 running status */}
      {frame >= SECOND_PROMPT_SUBMIT + 15 &&
        frame < TIMER2_START &&
        phase2Seconds &&
        phase2Tokens && (
          <div style={{ marginTop: 8 }}>
            <StatusLine seconds={phase2Seconds} tokens={phase2Tokens} />
          </div>
        )}
    </div>
  );
};
