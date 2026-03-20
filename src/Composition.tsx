import { AbsoluteFill } from "remotion";
import { MacTerminal } from "./components/MacTerminal";

export const MyComposition = () => {
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
      <MacTerminal />
    </AbsoluteFill>
  );
};
