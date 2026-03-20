import { useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import {
  ASSESSMENT_START,
  BASH_WRITESPEC_START,
  ASK_USER_START,
  ASK_USER_END,
  SPEC_SUMMARY_START,
  TIMER1_START,
  SECOND_PROMPT_SUBMIT,
  YAML_WRITE_START,
  TIMER2_START,
  THIRD_PROMPT_SUBMIT,
  BASH_FLEETGO_START,
  BASH_FLEETYAML_START,
  BASH_TEMPLATE_START,
} from "../../constants/timing";

const CLAMP = { extrapolateRight: "clamp" as const };

// Named scroll targets (px) — each represents the resting scroll position
// after a group of content has appeared
const SCROLL_ASSESSMENT = 100;
const SCROLL_TEMPLATE = 260;
const SCROLL_ANSWERS = 360;
const SCROLL_SPEC_SUMMARY = 440;
const SCROLL_SECOND_PROMPT = 500;
const SCROLL_YAML_WRITE = 730;
const SCROLL_TIMER2 = 860;
const SCROLL_THIRD_PROMPT = 960;
const SCROLL_FLEET_GO = 1180;

type ScrollSegment = {
  start: number;
  end: number;
  from: number;
  to: number;
};

const SCROLL_SEGMENTS: ScrollSegment[] = [
  { start: ASSESSMENT_START, end: ASSESSMENT_START + 30, from: 0, to: SCROLL_ASSESSMENT },
  { start: BASH_WRITESPEC_START, end: BASH_TEMPLATE_START + 20, from: SCROLL_ASSESSMENT, to: SCROLL_TEMPLATE },
  // Hold at SCROLL_TEMPLATE while AUQ is open (ASK_USER_START..ASK_USER_END)
  { start: ASK_USER_END, end: ASK_USER_END + 25, from: SCROLL_TEMPLATE, to: SCROLL_ANSWERS },
  { start: SPEC_SUMMARY_START, end: SPEC_SUMMARY_START + 30, from: SCROLL_ANSWERS, to: SCROLL_SPEC_SUMMARY },
  { start: TIMER1_START, end: SECOND_PROMPT_SUBMIT, from: SCROLL_SPEC_SUMMARY, to: SCROLL_SECOND_PROMPT },
  { start: SECOND_PROMPT_SUBMIT, end: BASH_FLEETYAML_START, from: SCROLL_SECOND_PROMPT, to: SCROLL_YAML_WRITE },
  { start: YAML_WRITE_START, end: TIMER2_START, from: SCROLL_YAML_WRITE, to: SCROLL_TIMER2 },
  { start: THIRD_PROMPT_SUBMIT, end: BASH_FLEETGO_START, from: SCROLL_TIMER2, to: SCROLL_THIRD_PROMPT },
  { start: BASH_FLEETGO_START, end: BASH_FLEETGO_START + 55, from: SCROLL_THIRD_PROMPT, to: SCROLL_FLEET_GO },
];

export function useTerminalScroll(): number {
  const frame = useCurrentFrame();
  return useMemo(() => {
    if (frame < ASSESSMENT_START) return 0;

    // Hold steady while AUQ is open
    if (frame >= ASK_USER_START && frame < ASK_USER_END) return SCROLL_TEMPLATE;

    // Find the last segment whose start we've passed
    let result = 0;
    for (const seg of SCROLL_SEGMENTS) {
      if (frame < seg.start) break;
      result = interpolate(frame, [seg.start, seg.end], [seg.from, seg.to], CLAMP);
    }
    return result;
  }, [frame]);
}
