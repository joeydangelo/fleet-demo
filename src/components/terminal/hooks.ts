import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

type SpeedSegment = { until: number; speed: number };

/**
 * Elapsed time display. Supports multi-speed segments:
 *   speed = number → constant multiplier
 *   speed = SpeedSegment[] → different speeds at different frames
 *     (each `until` is an absolute frame; speed applies from startFrame/prev until)
 */
export function useElapsedSeconds(
  startFrame: number,
  speed: number | SpeedSegment[] = 1,
  baseSeconds: number = 0,
): string | null {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return useMemo(() => {
    if (frame < startFrame) return null;

    let elapsed: number;
    if (typeof speed === "number") {
      elapsed = ((frame - startFrame) / fps) * speed;
    } else {
      // Walk through speed segments, accumulating real seconds
      elapsed = 0;
      let cursor = startFrame;
      for (const seg of speed) {
        if (frame <= cursor) break;
        const segEnd = Math.min(frame, seg.until);
        if (segEnd > cursor) {
          elapsed += ((segEnd - cursor) / fps) * seg.speed;
          cursor = segEnd;
        }
      }
      // Any remaining frames after all segments use the last segment's speed
      if (frame > cursor && speed.length > 0) {
        elapsed += ((frame - cursor) / fps) * speed[speed.length - 1].speed;
      }
    }

    const secs = Math.floor(elapsed + baseSeconds);
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  }, [frame, fps, startFrame, speed, baseSeconds]);
}

type TokenSegment = {
  startFrame: number;
  endFrame: number;
  rate: number;
};

export function useTokenCounter(
  startFrame: number,
  segments: TokenSegment[],
  baseTokens: number = 0,
): string | null {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return useMemo(() => {
    if (frame < startFrame) return null;
    let tokens = baseTokens;
    for (const seg of segments) {
      if (frame < seg.startFrame) break;
      const end = Math.min(frame, seg.endFrame);
      tokens += ((end - seg.startFrame) / fps) * seg.rate;
    }
    tokens = Math.floor(tokens);
    if (tokens > 1000) return `${(tokens / 1000).toFixed(1)}k`;
    return `${tokens}`;
  }, [frame, fps, startFrame, segments, baseTokens]);
}
