import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { MacTerminal } from "./components/MacTerminal";
import { VscodeEditor } from "./components/VscodeEditor";
import {
  TERMINAL_REPOSITION_START,
  SPEC_EDITOR_START,
  EDITOR_EXIT_START,
} from "./constants/timing";

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: terminal slides left + scales down to make room for editor
  const repositionFrame = frame - TERMINAL_REPOSITION_START;
  const reposition = repositionFrame >= 0
    ? spring({
        frame: repositionFrame,
        fps,
        config: { damping: 200 },
      })
    : 0;

  // Phase 3: editor exits, terminal recenters + scales back up
  const restoreFrame = frame - EDITOR_EXIT_START;
  const restore = restoreFrame >= 0
    ? spring({
        frame: restoreFrame,
        fps,
        config: { damping: 200 },
      })
    : 0;

  // Combined progress: reposition pushes left, restore brings back
  const layoutProgress = reposition * (1 - restore);

  const terminalX = interpolate(layoutProgress, [0, 1], [0, -300]);
  const terminalScale = interpolate(layoutProgress, [0, 1], [1, 0.82]);

  // Editor: visible after spec start, slides out during restore
  const editorVisible = frame >= SPEC_EDITOR_START && restore < 1;
  const editorSlideOut = interpolate(restore, [0, 1], [0, 120]);
  const editorOpacity = interpolate(restore, [0, 0.6], [1, 0], {
    extrapolateRight: "clamp",
  });

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
      {/* Terminal — animates left for editor, then back to center for fleet go */}
      <div
        style={{
          transform: `translateX(${terminalX}px) scale(${terminalScale})`,
          transformOrigin: "center center",
        }}
      >
        <MacTerminal />
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
    </AbsoluteFill>
  );
};
