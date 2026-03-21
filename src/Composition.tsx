import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FleetCli } from "./components/FleetCli";
import { MacTerminal } from "./components/MacTerminal";
import { VscodeEditor } from "./components/VscodeEditor";
import {
  TERMINAL_REPOSITION_START,
  SPEC_EDITOR_START,
  EDITOR_EXIT_START,
  FLEETGO_BACKGROUND,
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

  return (
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
    </AbsoluteFill>
  );
};
