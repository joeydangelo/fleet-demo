import React from "react";
import { useCurrentFrame } from "remotion";
import {
  SECOND_PROMPT_SUBMIT,
  BASH_DECOMPOSE_START,
  BASH_TASKSPLIT_START,
  BASH_FLEETYAML_START,
  YAML_WRITE_START,
  FINAL_SUMMARY_START,
  TIMER2_START,
} from "../constants/timing";
import { SECOND_PROMPT_TEXT } from "../constants/prompts";
import {
  SubLine,
  StatusLine,
  FadeIn,
  ToolHeader,
  SummaryBlock,
  SummaryParagraph,
  CrunchedTimer,
} from "./shared";
import { ToolStep, PromptLine } from "./terminal";

export function SpecPhaseContent({
  phase2Seconds,
  phase2Tokens,
}: {
  phase2Seconds: string | null;
  phase2Tokens: string | null;
}): React.ReactElement | null {
  const frame = useCurrentFrame();

  if (frame < SECOND_PROMPT_SUBMIT) return null;

  return (
    <>
      <div style={{ marginTop: 16 }}>
        <PromptLine text={SECOND_PROMPT_TEXT} />
      </div>

      <ToolStep label="Bash(fleet shortcut decompose-work)" start={BASH_DECOMPOSE_START} collapsedLines={57} />
      <ToolStep label="Bash(fleet guidelines task-splitting)" start={BASH_TASKSPLIT_START} collapsedLines={38} />
      <ToolStep label="Bash(fleet template fleet-yaml)" start={BASH_FLEETYAML_START} collapsedLines={56} />

      <FadeIn
        start={YAML_WRITE_START}
        style={{ marginBottom: 4, marginTop: 8 }}
      >
        <ToolHeader label="Write(.fleet/fleet.yaml)" />
        <SubLine>Wrote 64 lines</SubLine>
      </FadeIn>

      <FadeIn
        start={FINAL_SUMMARY_START}
        style={{ marginBottom: 4, marginTop: 12 }}
      >
        <SummaryBlock>
          <SummaryParagraph>
            Three tasks — middleware owns the sliding window limiter and Redis
            layer, config owns route-level limit definitions, api owns the
            client-facing status endpoint.
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
    </>
  );
}
