import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export function useElapsedSeconds(startFrame: number): string | null {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return useMemo(() => {
    if (frame < startFrame) return null;
    const elapsed = Math.floor((frame - startFrame) / fps);
    return `${elapsed}s`;
  }, [frame, fps, startFrame]);
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
