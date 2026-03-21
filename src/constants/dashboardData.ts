/**
 * Static data for the fleet dashboard displayed inside the MacTerminal.
 * Matches the layout and semantics of `fleet dashboard` from the CLI.
 */

// ── Types ────────────────────────────────────────────────────────────

/** Matches AgentDisplayStatus from fleet/src/lib/display-status.ts */
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
  agent: string;
  message: string;
  relativeTime: string;
}

export interface MergeEntry {
  taskName: string;
  status: MergeStatus;
  target: string;
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

/** Matches statusStyle() from fleet/src/lib/display-status.ts via inkColor() */
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

/** Matches mergeBadge() from fleet/src/commands/dashboard.tsx via inkColor() */
const MERGE_BADGE_STYLES: Record<MergeStatus, { label: string; color: string }> = {
  merged: { label: "merged", color: ANSI_GREEN },
  conflict: { label: "conflict", color: ANSI_RED },
  skipped: { label: "skipped", color: ANSI_GRAY },
  pending: { label: "pending", color: ANSI_YELLOW },
};

export function getMergeBadge(status: MergeStatus): { label: string; color: string } {
  return MERGE_BADGE_STYLES[status];
}

// ── Static dashboard data ────────────────────────────────────────────

export const DASHBOARD_VERSION = "0.1.0";
export const DASHBOARD_REFRESH_MS = 3000;
export const DASHBOARD_TARGET = "feature/rate-limiting";

export const AGENTS: AgentRow[] = [
  {
    name: "middleware",
    status: "working",
    verdict: null,
    duration: "2m 34s",
    tmuxAlive: true,
  },
  {
    name: "config",
    status: "pending",
    verdict: null,
    duration: "",
    tmuxAlive: true,
  },
];

export const MAIL_ENTRIES: MailEntry[] = [
  {
    agent: "middleware",
    message: "Reading spec and focus files",
    relativeTime: "12s ago",
  },
  {
    agent: "middleware",
    message: "Implementing sliding window rate limiter",
    relativeTime: "5s ago",
  },
];

export const MERGE_ENTRIES: MergeEntry[] = [];

// ── Column layout widths (character units) ───────────────────────────

export const COL_STATUS_ICON = 4;
export const COL_NAME = 17;
export const COL_STATUS = 14;
export const COL_REVIEW = 9;
export const COL_DURATION = 11;
export const COL_TMUX = 4;
