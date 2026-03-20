import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { MacTerminal } from "./components/MacTerminal";
import { VscodeEditor } from "./components/VscodeEditor";
import { TERMINAL_REPOSITION_START, SPEC_EDITOR_START } from "./constants/timing";

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminal repositions: slides left and scales down to make room for editor
  const repositionFrame = frame - TERMINAL_REPOSITION_START;
  const reposition = repositionFrame >= 0
    ? spring({
        frame: repositionFrame,
        fps,
        config: { damping: 200 },
      })
    : 0;

  const terminalX = interpolate(reposition, [0, 1], [0, -300]);
  const terminalScale = interpolate(reposition, [0, 1], [1, 0.82]);

  const editorVisible = frame >= SPEC_EDITOR_START;

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
      {/* Terminal — animates left when spec editor appears */}
      <div
        style={{
          transform: `translateX(${terminalX}px) scale(${terminalScale})`,
          transformOrigin: "center center",
        }}
      >
        <MacTerminal />
      </div>

      {/* VSCode editor — appears to the right of terminal */}
      {editorVisible && (
        <div
          style={{
            position: "absolute",
            right: interpolate(reposition, [0, 1], [-600, 40]),
          }}
        >
          <VscodeEditor />
        </div>
      )}
    </AbsoluteFill>
  );
};
