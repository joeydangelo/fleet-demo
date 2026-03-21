import { Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { uiSwitch, whip, whoosh } from "@remotion/sfx";
import {
  SUBMIT_FRAME,
  SCOUTS_START,
  SPEC_EDITOR_START,
  ASK_USER_START,
  ASK_USER_END,
  SECOND_PROMPT_SUBMIT,
  EDITOR_EXIT_START,
  THIRD_PROMPT_SUBMIT,
  FLEETGO_BACKGROUND,
  BROADCAST_PROMPT_SUBMIT,
  FLEETGO_COMPLETE,
  FINAL_MESSAGE_START,
  OUTRO_START,
} from "../constants/timing";

// "fleet dashboard" typing timing — must match MacTerminal.tsx constants
const COMMAND_TEXT = "fleet dashboard";
const TYPE_DELAY_SECONDS = 0.7;
const CHAR_FRAMES = 2;

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

function backgroundMusicVolume(f: number, fps: number): number {
  // Base volume: fade in, hold, fade out during outro
  const base = interpolate(
    f,
    [0, 30, OUTRO_START, OUTRO_START + 45],
    [0, 0.08, 0.08, 0],
    CLAMP,
  );

  // Gentle volume ducking — slow, wide transitions (60-90 frames = 2-3s ramps)
  // Duck during scouts + terminal output
  const duckScouts = interpolate(
    f,
    [SCOUTS_START, SCOUTS_START + 60, ASK_USER_START - 60, ASK_USER_START],
    [1.0, 0.75, 0.75, 1.0],
    CLAMP,
  );
  // Duck during ask-user (user reading)
  const duckAsk = interpolate(
    f,
    [ASK_USER_START, ASK_USER_START + 45, ASK_USER_END - 45, ASK_USER_END],
    [1.0, 0.7, 0.7, 1.0],
    CLAMP,
  );
  // Gentle swell for editor slide-in
  const swellEditor = interpolate(
    f,
    [SPEC_EDITOR_START - 15, SPEC_EDITOR_START + 30, SPEC_EDITOR_START + 60, SPEC_EDITOR_START + 90],
    [1.0, 1.2, 1.2, 1.0],
    CLAMP,
  );
  // Gradual swell into dashboard
  const swellDashboard = interpolate(
    f,
    [EDITOR_EXIT_START, FLEETGO_BACKGROUND + 45, FLEETGO_BACKGROUND + 90, FLEETGO_BACKGROUND + 120],
    [1.0, 1.3, 1.3, 0.8],
    CLAMP,
  );
  // Hold low during long dashboard
  const duckDashboard = interpolate(
    f,
    [FLEETGO_BACKGROUND + 120, FLEETGO_BACKGROUND + 150, FLEETGO_COMPLETE - 60, FLEETGO_COMPLETE],
    [0.8, 0.8, 0.8, 1.0],
    CLAMP,
  );
  // Gentle swell for finale
  const swellFinale = interpolate(
    f,
    [FLEETGO_COMPLETE, FLEETGO_COMPLETE + 45, FINAL_MESSAGE_START + 30, OUTRO_START - 30],
    [1.0, 1.3, 1.2, 1.0],
    CLAMP,
  );

  return base * duckScouts * duckAsk * swellEditor * swellDashboard * duckDashboard * swellFinale;
}

/** All audio — background music, SFX pops, swooshes, and chimes. */
export function AudioLayer({ fps }: { fps: number }): React.ReactElement {
  return (
    <>
      {/* Background music — trimmed so the first swell (~0.8s in) aligns with SUBMIT_FRAME */}
      <Audio
        src={staticFile("sigmamusicart-lofi-chill-jazz-272869.mp3")}
        loop
        trimBefore={Math.round(0.8 * fps)}
        volume={(f) => backgroundMusicVolume(f, fps)}
      />

      {/* SFX: Pop on each prompt submit */}
      <Sequence from={SUBMIT_FRAME} layout="none">
        <Audio src={staticFile("floraphonic-happy-pop-3-185288.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={SECOND_PROMPT_SUBMIT} layout="none">
        <Audio src={staticFile("floraphonic-happy-pop-3-185288.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={THIRD_PROMPT_SUBMIT} layout="none">
        <Audio src={staticFile("floraphonic-happy-pop-3-185288.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={BROADCAST_PROMPT_SUBMIT} layout="none">
        <Audio src={staticFile("floraphonic-happy-pop-3-185288.mp3")} volume={0.4} />
      </Sequence>

      {/* SFX: Pop when scouts launch */}
      <Sequence from={SCOUTS_START} layout="none">
        <Audio src={staticFile("sfx-pop.mp3")} volume={0.4} />
      </Sequence>

      {/* SFX: Click on each AskUserQuestion selection */}
      <Sequence from={ASK_USER_START + 53} layout="none">
        <Audio src={staticFile("yusuf_sfx-futuristic-ui-positive-selection-502158.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={ASK_USER_START + 122} layout="none">
        <Audio src={staticFile("yusuf_sfx-futuristic-ui-positive-selection-502158.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={ASK_USER_START + 188} layout="none">
        <Audio src={staticFile("yusuf_sfx-futuristic-ui-positive-selection-502158.mp3")} volume={0.4} />
      </Sequence>

      {/* SFX: Swoosh when editor slides in */}
      <Sequence from={SPEC_EDITOR_START} layout="none">
        <Audio src={whoosh} volume={0.5} />
      </Sequence>

      {/* SFX: Whoosh when MacTerminal slides in */}
      <Sequence from={FLEETGO_BACKGROUND} layout="none">
        <Audio src={whoosh} volume={0.5} />
      </Sequence>

      {/* SFX: Whip when editor slides out */}
      <Sequence from={EDITOR_EXIT_START} layout="none">
        <Audio src={whip} volume={0.5} />
      </Sequence>

      {/* SFX: Whip when outro scales down */}
      <Sequence from={OUTRO_START} layout="none">
        <Audio src={whip} volume={0.5} />
      </Sequence>

      {/* SFX: Keyboard clicks while typing "fleet dashboard" — one per character */}
      {Array.from({ length: COMMAND_TEXT.length }, (_, i) => {
        const typeDelay = Math.round(fps * TYPE_DELAY_SECONDS);
        const keyFrame = FLEETGO_BACKGROUND + typeDelay + i * CHAR_FRAMES;
        // Slight volume variation for natural feel
        const vol = 0.25 + (i % 3) * 0.05;
        return (
          <Sequence key={`key-${i}`} from={keyFrame} durationInFrames={CHAR_FRAMES} layout="none">
            <Audio src={uiSwitch} volume={vol} playbackRate={1.8} />
          </Sequence>
        );
      })}

      {/* SFX: Chime when fleet go completes */}
      <Sequence from={FLEETGO_COMPLETE} layout="none">
        <Audio src={staticFile("yusuf_sfx-kids-game-victory-502088.mp3")} volume={0.5} />
      </Sequence>
    </>
  );
}
