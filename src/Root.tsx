import "./index.css";
import { Composition } from "remotion";
import { FleetDemoComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FleetDemo"
        component={FleetDemoComposition}
        durationInFrames={1995}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
