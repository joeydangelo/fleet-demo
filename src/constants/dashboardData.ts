/**
 * Static data for the fleet dashboard displayed inside the MacTerminal.
 * Matches the layout and semantics of `fleet dashboard` from the CLI.
 */

// ── Types ────────────────────────────────────────────────────────────

export type AgentStatus = "running" | "pending" | "done" | "error";

export type Verdict = "pass" | "fail" | "skip" | null;

export type MergeStatus = "merged" | "conflict" | "skipped" | "pending";

export interface AgentRow {
  name: string;
  status: AgentStatus;
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

const STATUS_STYLES: Record<AgentStatus, StatusStyle> = {
  running: { icon: "●", color: "#4aa3e0" },
  pending: { icon: "○", color: "#808080" },
  done: { icon: "✓", color: "#7fa887" },
  error: { icon: "✗", color: "#d97757" },
};

export function getStatusStyle(status: AgentStatus): StatusStyle {
  return STATUS_STYLES[status];
}

const VERDICT_STYLES: Record<string, { label: string; color: string }> = {
  pass: { label: "PASS", color: "#7fa887" },
  fail: { label: "FAIL", color: "#d97757" },
  skip: { label: "SKIP", color: "#808080" },
};

export function getVerdictStyle(verdict: Verdict): { label: string; color: string } | null {
  if (verdict === null) return null;
  return VERDICT_STYLES[verdict] ?? null;
}

const MERGE_BADGE_STYLES: Record<MergeStatus, { label: string; color: string }> = {
  merged: { label: "merged", color: "#7fa887" },
  conflict: { label: "conflict", color: "#d97757" },
  skipped: { label: "skipped", color: "#808080" },
  pending: { label: "pending", color: "#d4a843" },
};

export function getMergeBadge(status: MergeStatus): { label: string; color: string } {
  return MERGE_BADGE_STYLES[status];
}

// ── Static dashboard data ────────────────────────────────────────────

export const DASHBOARD_VERSION = "0.2.4";
export const DASHBOARD_REFRESH_MS = 2000;
export const DASHBOARD_TARGET = "feature/rate-limiting";

export const AGENTS: AgentRow[] = [
  {
    name: "middleware",
    status: "running",
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
