/**
 * Types and style lookups for the fleet dashboard.
 */

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

const VERDICT_STYLES: Record<NonNullable<Verdict>, { label: string; color: string }> = {
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
