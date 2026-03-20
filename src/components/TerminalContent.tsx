import React, { useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
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
  BASH_FLEETGO_START,
  FLEETGO_BACKGROUND,
} from "../constants/timing";
import { GREEN, BLUE, GRAY, DIM, TEXT, BOLD_TEXT, ORANGE } from "../constants/theme";
import { Dot, SubLine, StatusLine, ScoutRow } from "./shared";
import { FadeIn } from "./shared/FadeIn";
import { ToolStep, PromptLine, useElapsedSeconds, useTokenCounter } from "./terminal";
import { useTerminalScroll } from "./terminal/useTerminalScroll";

export const TerminalContent: React.FC = () => {
  const frame = useCurrentFrame();

  const submitted = frame >= SUBMIT_FRAME;

  const runningSeconds = useElapsedSeconds(SKILL_START);

  const phase1Segments = useMemo(() => [
    { startFrame: SKILL_START, endFrame: ASK_USER_START, rate: 420 },
    { startFrame: ASK_USER_START, endFrame: ASK_USER_END, rate: 40 },
    { startFrame: ASK_USER_END, endFrame: Infinity, rate: 420 },
  ], []);
  const runningTokens = useTokenCounter(SKILL_START, phase1Segments);

  const phase2Seconds = useElapsedSeconds(SECOND_PROMPT_SUBMIT);

  const phase2Segments = useMemo(() => [
    { startFrame: SECOND_PROMPT_SUBMIT, endFrame: Infinity, rate: 480 },
  ], []);
  const phase2Tokens = useTokenCounter(SECOND_PROMPT_SUBMIT, phase2Segments);

  const phase3Seconds = useElapsedSeconds(THIRD_PROMPT_SUBMIT);

  const phase3Segments = useMemo(() => [
    { startFrame: THIRD_PROMPT_SUBMIT, endFrame: Infinity, rate: 3 },
  ], []);
  const phase3Tokens = useTokenCounter(THIRD_PROMPT_SUBMIT, phase3Segments, 105);

  const scrollOffset = useTerminalScroll();

  if (!submitted) return null;

  const scoutsDoneCount =
    (frame >= SCOUT1_DONE ? 1 : 0) +
    (frame >= SCOUT2_DONE ? 1 : 0) +
    (frame >= SCOUT3_DONE ? 1 : 0);
  const allScoutsDone = scoutsDoneCount === 3;

  return (
    <div style={{ transform: `translateY(-${scrollOffset}px)` }}>
      {/* Phase 1: Assess + spec */}
      <PromptLine text={PROMPT_TEXT} />

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

      <ToolStep label="Bash(assess-work)" start={BASH_ASSESS_START} collapsedLines={67} />
      <ToolStep label="Bash(codebase-research)" start={BASH_GUIDELINES_START} collapsedLines={30} />

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

      <ToolStep label="Bash(write-spec)" start={BASH_WRITESPEC_START} collapsedLines={67} />
      <ToolStep label="Bash(spec-design)" start={BASH_SPECDESIGN_START} collapsedLines={44} />
      <ToolStep label="Bash(template plan-spec)" start={BASH_TEMPLATE_START} collapsedLines={37} />

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

      <FadeIn start={TIMER1_START} style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: ORANGE, fontSize: 14, marginRight: 6 }}>✻</span>
          <span style={{ color: ORANGE, fontWeight: 600, fontSize: 12 }}>
            Crunched for 3m 38s
          </span>
        </div>
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
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Write(.fleet/fleet.yaml)
          </span>
        </div>
        <SubLine>Wrote 46 lines</SubLine>
      </FadeIn>

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

      <FadeIn start={TIMER2_START} style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: ORANGE, fontSize: 14, marginRight: 6 }}>✻</span>
          <span style={{ color: ORANGE, fontWeight: 600, fontSize: 12 }}>
            Crunched for 5m 52s
          </span>
        </div>
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

      <FadeIn
        start={BASH_FLEETGO_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={GREEN} />
          <span style={{ fontWeight: 700, color: BOLD_TEXT, fontSize: 13 }}>
            Bash(fleet go)
          </span>
        </div>

        {frame < FLEETGO_BACKGROUND && (
          <div
            style={{
              paddingLeft: 22,
              fontSize: 12,
              lineHeight: 1.7,
              marginTop: 4,
              opacity: interpolate(
                frame,
                [FLEETGO_BACKGROUND - 8, FLEETGO_BACKGROUND],
                [1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
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
                target: feature/rate-limiting · 2 tasks
              </span>
            </div>
            <FadeIn start={BASH_FLEETGO_START + 18} style={{}}>
              <div style={{ color: DIM }}>
                {"  "}◇{"  "}
                <span style={{ color: TEXT, fontWeight: 600 }}>fleet up</span>
              </div>
              <div style={{ color: DIM }}>
                {"  "}│{"  "}
                <span style={{ color: GRAY }}>middleware · config</span>
              </div>
            </FadeIn>
            <FadeIn start={BASH_FLEETGO_START + 36} style={{}}>
              <div style={{ color: DIM }}>
                {"  "}◇{"  "}
                <span style={{ color: TEXT, fontWeight: 600 }}>
                  fleet launch
                </span>
              </div>
              <div style={{ color: DIM }}>
                {"  "}│{"  "}
                <span style={{ color: GRAY }}>2 agents spawned</span>
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
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          >
            <SubLine>Running in the background (↓ to manage)</SubLine>
          </div>
        )}
      </FadeIn>

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
