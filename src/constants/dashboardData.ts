/**
 * Frame-driven dashboard state machine for the fleet dashboard
 * displayed inside the MacTerminal. Returns evolving agent states,
 * inter-agent mail, and merge queue based on the current frame offset.
 */

import {
  DASH_AGENTS_BOOT,
  DASH_MW_WORKING,
  DASH_CFG_WORKING,
  DASH_MAIL_1,
  DASH_MAIL_2,
  DASH_MAIL_3,
  DASH_MW_REVIEW,
  DASH_MAIL_4,
  DASH_MW_DONE,
  DASH_MERGE_MW,
  DASH_CFG_REVIEW,
  DASH_MAIL_5,
  DASH_CFG_DONE,
  DASH_MERGE_CFG,
  DASH_ALL_MERGED,
} from "./timing";

// ── Types ────────────────────────────────────────────────────────────

export type AgentDisplayStatus =
  | "pending"
  | "booting"
  | "working"
  | "stalled"
  | "zombie"
  | "in review"
  | "done";

export type Verdict = "pass" | "fail" | "skip" | null;

export type MergeStatus = "merged" | "conflict" | "skipped" | "pending";

export interface AgentRow {
  name: string;
  status: AgentDisplayStatus;
  verdict: Verdict;
  duration: string;
  tmuxAlive: boolean;
  /** Frame at which the current status began (for transition animations). */
  statusStartFrame: number;
  /** Frame at which the verdict appeared (0 if no verdict yet). */
  verdictFrame: number;
}

export interface MailEntry {
  prefix: string; // e.g. "[middleware → config]" or "[middleware]"
  message: string;
  relativeTime: string;
  /** Frame at which this mail appeared (for entrance animation). */
  appearFrame: number;
}

export interface MergeEntry {
  taskName: string;
  status: MergeStatus;
  target: string;
  /** Frame at which this entry appeared in the queue. */
  appearFrame: number;
  /** Frame at which the status last changed (for badge crossfade). */
  statusChangeFrame: number;
}

export interface DashboardSnapshot {
  agents: AgentRow[];
  mail: MailEntry[];
  merges: MergeEntry[];
  clockTime: string;
}

// ── Status display mapping ───────────────────────────────────────────

export interface StatusStyle {
  icon: string;
  color: string;
}

// ANSI terminal colors matching macOS Terminal.app dark profile
const ANSI_GREEN = "#55b45a";
const ANSI_YELLOW = "#c6a827";
const ANSI_RED = "#d44e40";
const ANSI_CYAN = "#4fb4d8";
const ANSI_GRAY = "#808080";

const STATUS_STYLES: Record<AgentDisplayStatus, StatusStyle> = {
  pending: { icon: "◌", color: ANSI_GRAY },
  booting: { icon: "◌", color: ANSI_GRAY },
  working: { icon: "●", color: ANSI_GREEN },
  stalled: { icon: "●", color: ANSI_YELLOW },
  zombie: { icon: "●", color: ANSI_RED },
  "in review": { icon: "⟳", color: ANSI_CYAN },
  done: { icon: "✓", color: ANSI_GREEN },
};

export function getStatusStyle(status: AgentDisplayStatus): StatusStyle {
  return STATUS_STYLES[status];
}

const VERDICT_STYLES: Record<string, { label: string; color: string }> = {
  pass: { label: "PASS", color: ANSI_GREEN },
  fail: { label: "FAIL", color: ANSI_RED },
  skip: { label: "SKIP", color: ANSI_GRAY },
};

export function getVerdictStyle(verdict: Verdict): { label: string; color: string } | null {
  if (verdict === null) return null;
  return VERDICT_STYLES[verdict] ?? null;
}

const MERGE_BADGE_STYLES: Record<MergeStatus, { label: string; color: string }> = {
  merged: { label: "merged", color: ANSI_GREEN },
  conflict: { label: "conflict", color: ANSI_RED },
  skipped: { label: "skipped", color: ANSI_GRAY },
  pending: { label: "pending", color: ANSI_YELLOW },
};

export function getMergeBadge(status: MergeStatus): { label: string; color: string } {
  return MERGE_BADGE_STYLES[status];
}

// ── Column layout widths (character units) ───────────────────────────

export const COL_STATUS_ICON = 4;
export const COL_NAME = 17;
export const COL_STATUS = 14;
export const COL_REVIEW = 9;
export const COL_DURATION = 11;
export const COL_TMUX = 4;

// ── Dashboard constants ──────────────────────────────────────────────

export const DASHBOARD_VERSION = "0.1.0";
export const DASHBOARD_REFRESH_MS = 3000;
export const DASHBOARD_TARGET = "feat/rate-limiting";

// ── Duration formatting ──────────────────────────────────────────────

/** Convert a real-seconds count to "Xm YYs" or "Xs" format. */
function formatDuration(realSeconds: number): string {
  const m = Math.floor(realSeconds / 60);
  const s = realSeconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/** Map video frames to a fake "real-time" duration string.
 *  Runs at 15x speed while the agent is active, then freezes at done. */
function frameToDuration(
  frameOffset: number,
  startFrame: number,
  doneFrame: number,
  fps: number,
): string {
  if (frameOffset < startFrame) return "";
  // Clamp to done frame — duration freezes when agent finishes
  const effectiveFrame = Math.min(frameOffset, doneFrame);
  const videoSeconds = (effectiveFrame - startFrame) / fps;
  const realSeconds = Math.floor(videoSeconds * 15);
  return formatDuration(realSeconds);
}

/** Map video frame offset to a fake clock time string.
 *  Starts at 3:42:18 PM, runs at 15x during builds, then decelerates
 *  back to 1x once all agents are done (DASH_ALL_MERGED). */
function frameToClockTime(frameOffset: number, fps: number): string {
  // Accumulate accelerated time up to DASH_ALL_MERGED
  const accelEnd = Math.min(frameOffset, DASH_ALL_MERGED);
  const accelVideoSec = accelEnd / fps;
  let realSeconds = Math.floor(accelVideoSec * 15);

  // After all merged, clock ticks at real-time (1x)
  if (frameOffset > DASH_ALL_MERGED) {
    const normalVideoSec = (frameOffset - DASH_ALL_MERGED) / fps;
    realSeconds += Math.floor(normalVideoSec);
  }

  const baseHour = 15; // 3 PM
  const baseMin = 42;
  const baseSec = 18;
  const totalSec = baseHour * 3600 + baseMin * 60 + baseSec + realSeconds;
  const h = Math.floor(totalSec / 3600) % 12 || 12;
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  const ampm = Math.floor(totalSec / 3600) % 24 >= 12 ? "PM" : "AM";
  return `${h}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")} ${ampm}`;
}

// ── State machine ────────────────────────────────────────────────────

interface AgentState {
  status: AgentDisplayStatus;
  statusStartFrame: number;
}

function resolveAgentState(f: number, agent: "mw" | "cfg"): AgentState {
  // Ordered transitions: each entry is [frame, status]
  const transitions: [number, AgentDisplayStatus][] = agent === "mw"
    ? [
        [0, "pending"],
        [DASH_AGENTS_BOOT, "booting"],
        [DASH_MW_WORKING, "working"],
        [DASH_MW_REVIEW, "in review"],
        [DASH_MW_DONE, "done"],
      ]
    : [
        [0, "pending"],
        [DASH_AGENTS_BOOT, "booting"],
        [DASH_CFG_WORKING, "working"],
        [DASH_CFG_REVIEW, "in review"],
        [DASH_CFG_DONE, "done"],
      ];

  let status: AgentDisplayStatus = "pending";
  let startFrame = 0;
  for (const [frame, s] of transitions) {
    if (f >= frame) {
      status = s;
      startFrame = frame;
    }
  }
  return { status, statusStartFrame: startFrame };
}

function resolveVerdicts(f: number): { mw: Verdict; cfg: Verdict } {
  return {
    mw: f >= DASH_MW_DONE ? "pass" : null,
    cfg: f >= DASH_CFG_DONE ? "pass" : null,
  };
}

const MAIL_DEFS: { frame: number; prefix: string; message: string }[] = [
  { frame: DASH_MAIL_1, prefix: "[middleware → config]", message: "I'll own the Redis layer — avoid importing redis directly" },
  { frame: DASH_MAIL_2, prefix: "[config → middleware]", message: "Got it. I'll define limits in route config and read from your exports" },
  { frame: DASH_MAIL_3, prefix: "[middleware → config]", message: "Exported RateLimiter class + checkLimit() — ready when you are" },
  { frame: DASH_MAIL_4, prefix: "[middleware]", message: "Submitting for review — sliding window + Redis done" },
  { frame: DASH_MAIL_5, prefix: "[config]", message: "Submitting for review — route configs + headers wired" },
];

function buildMail(f: number): MailEntry[] {
  const entries: MailEntry[] = [];
  for (const def of MAIL_DEFS) {
    if (f >= def.frame) {
      entries.push({
        prefix: def.prefix,
        message: def.message,
        relativeTime: relativeTimeStr(f, def.frame),
        appearFrame: def.frame,
      });
    }
  }
  return entries.slice(-5);
}

/** Fake relative time that ticks at 15x speed. */
function relativeTimeStr(currentFrame: number, eventFrame: number): string {
  const deltaFrames = currentFrame - eventFrame;
  const realSec = Math.floor((deltaFrames / 30) * 15);
  if (realSec < 60) return `${realSec}s ago`;
  const m = Math.floor(realSec / 60);
  return `${m}m ago`;
}

function buildMerges(f: number): MergeEntry[] {
  const entries: MergeEntry[] = [];

  if (f >= DASH_MERGE_MW) {
    entries.push({
      taskName: "middleware",
      status: "merged",
      target: DASHBOARD_TARGET,
      appearFrame: DASH_MERGE_MW,
      statusChangeFrame: DASH_MERGE_MW,
    });
  }

  if (f >= DASH_MERGE_CFG) {
    entries.push({
      taskName: "config",
      status: "merged",
      target: DASHBOARD_TARGET,
      appearFrame: DASH_MERGE_CFG,
      statusChangeFrame: DASH_MERGE_CFG,
    });
  }

  return entries;
}

/** Returns the full dashboard state for a given frame offset from FLEETGO_BACKGROUND. */
export function getDashboardState(dashFrame: number, fps: number): DashboardSnapshot {
  const mwState = resolveAgentState(dashFrame, "mw");
  const cfgState = resolveAgentState(dashFrame, "cfg");
  const verdicts = resolveVerdicts(dashFrame);

  const agents: AgentRow[] = [
    {
      name: "middleware",
      status: mwState.status,
      verdict: verdicts.mw,
      duration: frameToDuration(dashFrame, DASH_MW_WORKING, DASH_MW_DONE, fps),
      tmuxAlive: mwState.status !== "done",
      statusStartFrame: mwState.statusStartFrame,
      verdictFrame: verdicts.mw ? DASH_MW_DONE : 0,
    },
    {
      name: "config",
      status: cfgState.status,
      verdict: verdicts.cfg,
      duration: frameToDuration(dashFrame, DASH_CFG_WORKING, DASH_CFG_DONE, fps),
      tmuxAlive: cfgState.status !== "done",
      statusStartFrame: cfgState.statusStartFrame,
      verdictFrame: verdicts.cfg ? DASH_CFG_DONE : 0,
    },
  ];

  return {
    agents,
    mail: buildMail(dashFrame),
    merges: buildMerges(dashFrame),
    clockTime: frameToClockTime(dashFrame, fps),
  };
}
