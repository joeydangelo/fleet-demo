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
}

export interface MailEntry {
  prefix: string; // e.g. "[middleware → config]" or "[middleware] broadcast:"
  message: string;
  relativeTime: string;
}

export interface MergeEntry {
  taskName: string;
  status: MergeStatus;
  target: string;
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

function resolveAgentStatus(f: number): { mw: AgentDisplayStatus; cfg: AgentDisplayStatus } {
  let mw: AgentDisplayStatus = "pending";
  let cfg: AgentDisplayStatus = "pending";

  if (f >= DASH_AGENTS_BOOT) { mw = "booting"; cfg = "booting"; }
  if (f >= DASH_MW_WORKING) mw = "working";
  if (f >= DASH_CFG_WORKING) cfg = "working";
  if (f >= DASH_MW_REVIEW) mw = "in review";
  if (f >= DASH_MW_DONE) mw = "done";
  if (f >= DASH_CFG_REVIEW) cfg = "in review";
  if (f >= DASH_CFG_DONE) cfg = "done";

  return { mw, cfg };
}

function resolveVerdicts(f: number): { mw: Verdict; cfg: Verdict } {
  return {
    mw: f >= DASH_MW_DONE ? "pass" : null,
    cfg: f >= DASH_CFG_DONE ? "pass" : null,
  };
}

function buildMail(f: number): MailEntry[] {
  const entries: MailEntry[] = [];

  if (f >= DASH_MAIL_1) {
    entries.push({
      prefix: "[middleware → config]",
      message: "I'll own the Redis layer — avoid importing redis directly",
      relativeTime: relativeTimeStr(f, DASH_MAIL_1),
    });
  }
  if (f >= DASH_MAIL_2) {
    entries.push({
      prefix: "[config → middleware]",
      message: "Got it. I'll define limits in route config and read from your exports",
      relativeTime: relativeTimeStr(f, DASH_MAIL_2),
    });
  }
  if (f >= DASH_MAIL_3) {
    entries.push({
      prefix: "[middleware → config]",
      message: "Exported RateLimiter class + checkLimit() — ready when you are",
      relativeTime: relativeTimeStr(f, DASH_MAIL_3),
    });
  }
  if (f >= DASH_MAIL_4) {
    entries.push({
      prefix: "[middleware]",
      message: "Submitting for review — sliding window + Redis done",
      relativeTime: relativeTimeStr(f, DASH_MAIL_4),
    });
  }
  if (f >= DASH_MAIL_5) {
    entries.push({
      prefix: "[config]",
      message: "Submitting for review — route configs + headers wired",
      relativeTime: relativeTimeStr(f, DASH_MAIL_5),
    });
  }

  // Only show the 5 most recent
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

  if (f >= DASH_MERGE_MW && f < DASH_ALL_MERGED) {
    entries.push({
      taskName: "middleware",
      status: f >= DASH_MW_DONE + 30 ? "merged" : "pending",
      target: DASHBOARD_TARGET,
    });
  } else if (f >= DASH_ALL_MERGED) {
    entries.push({
      taskName: "middleware",
      status: "merged",
      target: DASHBOARD_TARGET,
    });
  }

  if (f >= DASH_MERGE_CFG && f < DASH_ALL_MERGED) {
    entries.push({
      taskName: "config",
      status: "pending",
      target: DASHBOARD_TARGET,
    });
  } else if (f >= DASH_ALL_MERGED) {
    entries.push({
      taskName: "config",
      status: "merged",
      target: DASHBOARD_TARGET,
    });
  }

  return entries;
}

/** Returns the full dashboard state for a given frame offset from FLEETGO_BACKGROUND. */
export function getDashboardState(dashFrame: number, fps: number): DashboardSnapshot {
  const { mw, cfg } = resolveAgentStatus(dashFrame);
  const verdicts = resolveVerdicts(dashFrame);

  const agents: AgentRow[] = [
    {
      name: "middleware",
      status: mw,
      verdict: verdicts.mw,
      duration: frameToDuration(dashFrame, DASH_MW_WORKING, DASH_MW_DONE, fps),
      tmuxAlive: mw !== "done",
    },
    {
      name: "config",
      status: cfg,
      verdict: verdicts.cfg,
      duration: frameToDuration(dashFrame, DASH_CFG_WORKING, DASH_CFG_DONE, fps),
      tmuxAlive: cfg !== "done",
    },
  ];

  return {
    agents,
    mail: buildMail(dashFrame),
    merges: buildMerges(dashFrame),
    clockTime: frameToClockTime(dashFrame, fps),
  };
}
