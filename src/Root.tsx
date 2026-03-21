import "./index.css";
import { Composition } from "remotion";
import { FleetDemoComposition } from "./Composition";
import { TOTAL_DURATION } from "./constants/timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FleetDemo"
        component={FleetDemoComposition}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
