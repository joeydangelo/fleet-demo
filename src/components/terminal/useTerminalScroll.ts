import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
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
  FLEETGO_BACKGROUND,
  BROADCAST_PROMPT_SUBMIT,
  FLEETGO_COMPLETE,
  BASH_GITLOG_START,
  BASH_TEST_START,
  FINAL_MESSAGE_START,
} from "../../constants/timing";
import { SPRING_LAYOUT } from "../../constants/theme";

const CLAMP_BOTH = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// Named scroll targets (px)
const SCROLL_ASSESSMENT = 100;
const SCROLL_TEMPLATE = 260;
const SCROLL_ANSWERS = 360;
const SCROLL_SPEC_SUMMARY = 440;
const SCROLL_SECOND_PROMPT = 500;
const SCROLL_YAML_WRITE = 730;
const SCROLL_TIMER2 = 860;
const SCROLL_THIRD_PROMPT = 960;
const SCROLL_FLEET_GO = 1180;
const SCROLL_FLEET_GO_BG = 1060;
const SCROLL_BROADCAST = 1120;
const SCROLL_COMPLETE = 1260;
const SCROLL_GITLOG = 1340;
const SCROLL_TESTS = 1410;
const SCROLL_FINAL = 1500;

type ScrollSegment = {
  start: number;
  end: number;
  from: number;
  to: number;
};

// Pre-background: eased interpolation
const SCROLL_SEGMENTS: ScrollSegment[] = [
  { start: ASSESSMENT_START, end: ASSESSMENT_START + 30, from: 0, to: SCROLL_ASSESSMENT },
  { start: BASH_WRITESPEC_START, end: BASH_TEMPLATE_START + 20, from: SCROLL_ASSESSMENT, to: SCROLL_TEMPLATE },
  { start: ASK_USER_END, end: ASK_USER_END + 25, from: SCROLL_TEMPLATE, to: SCROLL_ANSWERS },
  { start: SPEC_SUMMARY_START, end: SPEC_SUMMARY_START + 30, from: SCROLL_ANSWERS, to: SCROLL_SPEC_SUMMARY },
  { start: TIMER1_START, end: SECOND_PROMPT_SUBMIT, from: SCROLL_SPEC_SUMMARY, to: SCROLL_SECOND_PROMPT },
  { start: SECOND_PROMPT_SUBMIT, end: BASH_FLEETYAML_START, from: SCROLL_SECOND_PROMPT, to: SCROLL_YAML_WRITE },
  { start: YAML_WRITE_START, end: TIMER2_START, from: SCROLL_YAML_WRITE, to: SCROLL_TIMER2 },
  { start: THIRD_PROMPT_SUBMIT, end: BASH_FLEETGO_START, from: SCROLL_TIMER2, to: SCROLL_THIRD_PROMPT },
  { start: BASH_FLEETGO_START, end: BASH_FLEETGO_START + 55, from: SCROLL_THIRD_PROMPT, to: SCROLL_FLEET_GO },
];

// Post-background: spring-driven for natural motion
// Each entry: [triggerFrame, delay, fromScroll, toScroll]
const POST_BG_SPRINGS: [number, number, number, number][] = [
  [FLEETGO_BACKGROUND, 0, SCROLL_FLEET_GO, SCROLL_FLEET_GO_BG],
  [BROADCAST_PROMPT_SUBMIT, 0, SCROLL_FLEET_GO_BG, SCROLL_BROADCAST],
  [FLEETGO_COMPLETE, 12, SCROLL_BROADCAST, SCROLL_COMPLETE],
  [BASH_GITLOG_START, 10, SCROLL_COMPLETE, SCROLL_GITLOG],
  [BASH_TEST_START, 10, SCROLL_GITLOG, SCROLL_TESTS],
  [FINAL_MESSAGE_START, 8, SCROLL_TESTS, SCROLL_FINAL],
];

export function useTerminalScroll(): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return useMemo(() => {
    if (frame < ASSESSMENT_START) return 0;
    if (frame >= ASK_USER_START && frame < ASK_USER_END) return SCROLL_TEMPLATE;

    // Pre-background: eased interpolation
    if (frame < FLEETGO_BACKGROUND) {
      let result = 0;
      for (const seg of SCROLL_SEGMENTS) {
        if (frame < seg.start) break;
        result = interpolate(
          frame,
          [seg.start, seg.end],
          [seg.from, seg.to],
          { ...CLAMP_BOTH, easing: Easing.inOut(Easing.ease) },
        );
      }
      return result;
    }

    // Post-background: layer springs additively
    // Start at SCROLL_FLEET_GO, then each spring moves from its `from` to `to`
    let result = SCROLL_FLEET_GO;
    for (const [trigger, delay, from, to] of POST_BG_SPRINGS) {
      const localFrame = frame - (trigger + delay);
      if (localFrame < 0) break;
      const progress = spring({
        frame: localFrame,
        fps,
        config: SPRING_LAYOUT,
      });
      // Each spring replaces the previous resting position
      result = from + (to - from) * progress;
    }
    return result;
  }, [frame, fps]);
}
