import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { FleetCli } from "./components/FleetCli";
import { MacTerminal } from "./components/MacTerminal";
import { VscodeEditor } from "./components/VscodeEditor";
import {
  SUBMIT_FRAME,
  SCOUTS_START,
  TERMINAL_REPOSITION_START,
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
} from "./constants/timing";
import { SPRING_LAYOUT } from "./constants/theme";

export const FleetDemoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: terminal slides left + scales down to make room for editor
  const repositionFrame = frame - TERMINAL_REPOSITION_START;
  const reposition = repositionFrame >= 0
    ? spring({
        frame: repositionFrame,
        fps,
        config: SPRING_LAYOUT,
      })
    : 0;

  // Phase 3: editor exits, terminal recenters + scales back up
  const restoreFrame = frame - EDITOR_EXIT_START;
  const restore = restoreFrame >= 0
    ? spring({
        frame: restoreFrame,
        fps,
        config: SPRING_LAYOUT,
      })
    : 0;

  // Combined progress: reposition pushes left, restore brings back
  const layoutProgress = reposition * (1 - restore);

  const terminalX = interpolate(layoutProgress, [0, 1], [0, -300]);
  const terminalScale = interpolate(layoutProgress, [0, 1], [1, 0.82]);

  // Editor: visible after spec start, slides out during restore
  const editorVisible = frame >= SPEC_EDITOR_START && restore < 0.99;
  const editorSlideOut = interpolate(restore, [0, 1], [0, 120]);
  const editorOpacity = interpolate(restore, [0, 0.6], [1, 0], {
    extrapolateRight: "clamp",
  });

  // Phase 4: Mac terminal slides in during fleet go background
  const macTermFrame = frame - FLEETGO_BACKGROUND;
  const macTermReposition = macTermFrame >= 0
    ? spring({
        frame: macTermFrame,
        fps,
        config: SPRING_LAYOUT,
      })
    : 0;

  // Fleet CLI shifts left again when mac terminal appears
  const fleetGoShift = interpolate(macTermReposition, [0, 1], [0, -280]);
  const fleetGoScale = interpolate(macTermReposition, [0, 1], [1, 0.85]);

  // Outro: everything scales down to center and disappears
  const outroFrame = frame - OUTRO_START;
  const outroProgress = outroFrame >= 0
    ? spring({
        frame: outroFrame,
        fps,
        config: { damping: 28, stiffness: 120, mass: 0.9 },
      })
    : 0;

  const outroScale = interpolate(outroProgress, [0, 1], [1, 0]);
  const outroRotate = interpolate(outroProgress, [0, 1], [0, -3]);
  const outroOpacity = interpolate(outroProgress, [0, 0.7], [1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Background music — trimmed so the first swell (~0.8s in) aligns with SUBMIT_FRAME */}
      <Audio
        src={staticFile("sigmamusicart-lofi-chill-jazz-272869.mp3")}
        loop
        trimBefore={Math.round(0.8 * fps)}
        volume={(f) => {
          const compFrame = f;
          const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

          // Base volume: fade in, hold, fade out during outro
          const base = interpolate(
            compFrame,
            [0, 30, OUTRO_START, OUTRO_START + 45],
            [0, 0.08, 0.08, 0],
            clamp,
          );

          // Gentle volume ducking — slow, wide transitions (60-90 frames = 2-3s ramps)
          // Duck during scouts + terminal output
          const duckScouts = interpolate(
            compFrame,
            [SCOUTS_START, SCOUTS_START + 60, ASK_USER_START - 60, ASK_USER_START],
            [1.0, 0.75, 0.75, 1.0],
            clamp,
          );
          // Duck during ask-user (user reading)
          const duckAsk = interpolate(
            compFrame,
            [ASK_USER_START, ASK_USER_START + 45, ASK_USER_END - 45, ASK_USER_END],
            [1.0, 0.7, 0.7, 1.0],
            clamp,
          );
          // Gentle swell for editor slide-in
          const swellEditor = interpolate(
            compFrame,
            [SPEC_EDITOR_START - 15, SPEC_EDITOR_START + 30, SPEC_EDITOR_START + 60, SPEC_EDITOR_START + 90],
            [1.0, 1.2, 1.2, 1.0],
            clamp,
          );
          // Gradual swell into dashboard
          const swellDashboard = interpolate(
            compFrame,
            [EDITOR_EXIT_START, FLEETGO_BACKGROUND + 45, FLEETGO_BACKGROUND + 90, FLEETGO_BACKGROUND + 120],
            [1.0, 1.3, 1.3, 0.8],
            clamp,
          );
          // Hold low during long dashboard
          const duckDashboard = interpolate(
            compFrame,
            [FLEETGO_BACKGROUND + 120, FLEETGO_BACKGROUND + 150, FLEETGO_COMPLETE - 60, FLEETGO_COMPLETE],
            [0.8, 0.8, 0.8, 1.0],
            clamp,
          );
          // Gentle swell for finale
          const swellFinale = interpolate(
            compFrame,
            [FLEETGO_COMPLETE, FLEETGO_COMPLETE + 45, FINAL_MESSAGE_START + 30, OUTRO_START - 30],
            [1.0, 1.3, 1.2, 1.0],
            clamp,
          );

          return base * duckScouts * duckAsk * swellEditor * swellDashboard * duckDashboard * swellFinale;
        }}
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
        <Audio src={staticFile("whoosh.wav")} volume={0.5} />
      </Sequence>

      {/* SFX: Whoosh when MacTerminal slides in */}
      <Sequence from={FLEETGO_BACKGROUND} layout="none">
        <Audio src={staticFile("whoosh.wav")} volume={0.5} />
      </Sequence>

      {/* SFX: Whip when editor slides out */}
      <Sequence from={EDITOR_EXIT_START} layout="none">
        <Audio src={staticFile("whip.wav")} volume={0.5} />
      </Sequence>

      {/* SFX: Whip when outro scales down */}
      <Sequence from={OUTRO_START} layout="none">
        <Audio src={staticFile("whip.wav")} volume={0.5} />
      </Sequence>

      {/* SFX: Chime when fleet go completes */}
      <Sequence from={FLEETGO_COMPLETE} layout="none">
        <Audio src={staticFile("yusuf_sfx-kids-game-victory-502088.mp3")} volume={0.5} />
      </Sequence>
    <AbsoluteFill
      style={{
        backgroundColor: "#e8e2d9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Outro wrapper — scales everything down to center */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          transform: `scale(${outroScale}) rotate(${outroRotate}deg)`,
          opacity: outroOpacity,
          transformOrigin: "center center",
        }}
      >
        {/* Fleet CLI — animates left for editor, recenters, then shifts left again for mac terminal */}
        <div
          style={{
            transform: `translateX(${terminalX + fleetGoShift}px) scale(${terminalScale * fleetGoScale})`,
            transformOrigin: "center center",
          }}
        >
          <FleetCli />
        </div>

        {/* VSCode editor — slides in from right, slides out when fleet go starts */}
        {editorVisible && (
          <div
            style={{
              position: "absolute",
              right: interpolate(reposition, [0, 1], [-600, 40]) - editorSlideOut,
              opacity: editorOpacity,
            }}
          >
            <VscodeEditor />
          </div>
        )}

        {/* Mac terminal — slides in from right during fleet go background */}
        {frame >= FLEETGO_BACKGROUND && (
          <div
            style={{
              position: "absolute",
              right: interpolate(macTermReposition, [0, 1], [-600, 40]),
            }}
          >
            <MacTerminal />
          </div>
        )}
      </div>
    </AbsoluteFill>
    </>
  );
};
