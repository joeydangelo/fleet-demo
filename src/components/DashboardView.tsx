import React from "react";
import { spring, interpolate } from "remotion";
import { SPRING_LAYOUT } from "../constants/theme";
import {
  getDashboardState,
  getStatusStyle,
  getVerdictStyle,
  getMergeBadge,
  DASHBOARD_VERSION,
  DASHBOARD_REFRESH_MS,
  COL_STATUS_ICON,
  COL_NAME,
  COL_STATUS,
  COL_REVIEW,
  COL_DURATION,
  COL_TMUX,
} from "../constants/dashboardData";
import type {
  AgentRow,
  MailEntry,
  MergeEntry as MergeEntryType,
  DashboardSnapshot,
} from "../constants/dashboardData";

// Dashboard layout
const TERM_TEXT = "#cccccc";
const TERM_DIM = "#808080";
const GRID_WIDTH_CH = 72;
const HRULE_CHAR = "─";

const COL_CELL: React.CSSProperties = {
  display: "inline-block",
  whiteSpace: "pre",
};

// ── Small layout pieces ──────────────────────────────────────────────

function HRule(): React.ReactElement {
  return (
    <div style={{ color: TERM_DIM, whiteSpace: "pre" }}>
      {HRULE_CHAR.repeat(GRID_WIDTH_CH)}
    </div>
  );
}

function HeaderBar({ clockTime }: { clockTime: string }): React.ReactElement {
  const left = `fleet dashboard v${DASHBOARD_VERSION}`;
  const right = `${clockTime}  |  refresh: ${DASHBOARD_REFRESH_MS}ms`;
  const gap = Math.max(1, GRID_WIDTH_CH - left.length - right.length);

  return (
    <div style={{ display: "flex", whiteSpace: "pre" }}>
      <span style={{ color: TERM_TEXT, fontWeight: 700 }}>{left}</span>
      <span>{" ".repeat(gap)}</span>
      <span style={{ color: TERM_TEXT }}>{right}</span>
    </div>
  );
}

function AgentHeaderRow(): React.ReactElement {
  return (
    <div style={{ color: TERM_DIM, whiteSpace: "pre" }}>
      {"  "}
      <span style={{ ...COL_CELL, width: `${COL_STATUS_ICON}ch` }}>{"St"}</span>
      <span style={{ ...COL_CELL, width: `${COL_NAME}ch` }}>{"Name"}</span>
      <span style={{ ...COL_CELL, width: `${COL_STATUS}ch` }}>{"Status"}</span>
      <span style={{ ...COL_CELL, width: `${COL_REVIEW}ch` }}>{"Review"}</span>
      <span style={{ ...COL_CELL, width: `${COL_DURATION}ch` }}>{"Duration"}</span>
      <span style={{ ...COL_CELL, width: `${COL_TMUX}ch` }}>{"Tmux"}</span>
    </div>
  );
}

// ── Row renderers ────────────────────────────────────────────────────

function AgentRowView({
  agent,
  dashFrame,
}: {
  agent: AgentRow;
  dashFrame: number;
}): React.ReactElement {
  const style = getStatusStyle(agent.status);
  const verdictStyle = getVerdictStyle(agent.verdict);
  const nameDisplay = agent.name.length > 15
    ? agent.name.slice(0, 15) + "…"
    : agent.name;

  // Fade-in on status transition (~10 frames)
  // Skip for pending/booting — same icon and color, no visual change
  const skipTransition = agent.status === "pending" || agent.status === "booting";
  const statusAge = dashFrame - agent.statusStartFrame;
  const statusOpacity = skipTransition
    ? 1
    : interpolate(statusAge, [0, 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  // Verdict: same crossfade as status
  const verdictAge = agent.verdictFrame > 0 ? dashFrame - agent.verdictFrame : -1;
  const verdictOpacity = verdictAge >= 0
    ? interpolate(verdictAge, [0, 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <div style={{ whiteSpace: "pre" }}>
      {"  "}
      <span style={{ ...COL_CELL, width: `${COL_STATUS_ICON}ch`, opacity: statusOpacity }}>
        <span style={{ color: style.color }}>{style.icon}</span>
      </span>
      <span style={{ ...COL_CELL, width: `${COL_NAME}ch`, color: TERM_TEXT }}>{nameDisplay}</span>
      <span style={{ ...COL_CELL, width: `${COL_STATUS}ch`, color: style.color, opacity: statusOpacity }}>
        {agent.status}
      </span>
      <span style={{ ...COL_CELL, width: `${COL_REVIEW}ch` }}>
        {verdictStyle ? (
          <span style={{ color: verdictStyle.color, opacity: verdictOpacity }}>
            {verdictStyle.label}
          </span>
        ) : null}
      </span>
      <span style={{ ...COL_CELL, width: `${COL_DURATION}ch`, color: TERM_TEXT }}>{agent.duration}</span>
      <span style={{ ...COL_CELL, width: `${COL_TMUX}ch` }}>
        {agent.tmuxAlive && <span style={{ color: "#55b45a" }}>●</span>}
      </span>
    </div>
  );
}

// ── Panel sections ───────────────────────────────────────────────────

function AgentsPanel({
  agents,
  dashFrame,
}: {
  agents: AgentRow[];
  dashFrame: number;
}): React.ReactElement {
  return (
    <div style={{ paddingLeft: 4, paddingRight: 4 }}>
      <div style={{ color: TERM_TEXT, fontWeight: 700 }}>
        Agents ({agents.length})
      </div>
      <AgentHeaderRow />
      {agents.map((agent) => (
        <AgentRowView key={agent.name} agent={agent} dashFrame={dashFrame} />
      ))}
    </div>
  );
}

function MailRowView({
  entry,
  dashFrame,
  fps,
}: {
  entry: MailEntry;
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  const age = Math.max(0, dashFrame - entry.appearFrame);
  const entrance = spring({
    frame: age,
    fps,
    config: SPRING_LAYOUT,
  });
  const slideX = interpolate(entrance, [0, 1], [-20, 0]);

  return (
    <div style={{
      whiteSpace: "pre",
      overflow: "hidden",
      textOverflow: "ellipsis",
      color: TERM_TEXT,
      opacity: entrance,
      transform: `translateX(${slideX}px)`,
    }}>
      <span style={{ color: TERM_DIM }}>{entry.prefix}</span>{" "}
      {entry.message}{" "}
      <span style={{ color: TERM_DIM }}>({entry.relativeTime})</span>
    </div>
  );
}

function MailPanel({
  mail,
  dashFrame,
  fps,
}: {
  mail: MailEntry[];
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  return (
    <div style={{ width: "50%", paddingLeft: 4, overflow: "hidden" }}>
      <div style={{ color: TERM_TEXT, fontWeight: 700 }}>
        Mail ({mail.length})
      </div>
      {mail.length === 0 && (
        <div style={{ color: TERM_DIM }}>No messages</div>
      )}
      {mail.map((entry) => (
        <MailRowView key={entry.appearFrame} entry={entry} dashFrame={dashFrame} fps={fps} />
      ))}
    </div>
  );
}

function MergeRowView({
  entry,
  dashFrame,
  fps,
}: {
  entry: MergeEntryType;
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  const badge = getMergeBadge(entry.status);

  // Row entrance: slide in from left
  const rowAge = Math.max(0, dashFrame - entry.appearFrame);
  const rowEntrance = spring({
    frame: rowAge,
    fps,
    config: SPRING_LAYOUT,
  });
  const slideX = interpolate(rowEntrance, [0, 1], [-20, 0]);

  // Badge crossfade when status changes (pending → merged)
  const statusChanged = entry.statusChangeFrame > entry.appearFrame;
  const badgeAge = Math.max(0, dashFrame - entry.statusChangeFrame);
  const badgeOpacity = statusChanged
    ? interpolate(badgeAge, [0, 8], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <div style={{
      display: "flex",
      whiteSpace: "pre",
      gap: 8,
      opacity: rowEntrance,
      transform: `translateX(${slideX}px)`,
    }}>
      <span style={{ width: "10ch", color: badge.color, opacity: badgeOpacity }}>
        {badge.label}
      </span>
      <span style={{ width: "15ch", color: TERM_TEXT }}>{entry.taskName}</span>
      <span style={{ color: TERM_DIM }}>{entry.target}</span>
    </div>
  );
}

function MergeQueuePanel({
  merges,
  dashFrame,
  fps,
}: {
  merges: MergeEntryType[];
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  return (
    <div style={{ width: "50%", paddingLeft: 8, overflow: "hidden" }}>
      <div style={{ color: TERM_TEXT, fontWeight: 700 }}>
        Merge Queue ({merges.length})
      </div>
      {merges.length === 0 && (
        <div style={{ color: TERM_DIM }}>No merges</div>
      )}
      {merges.map((entry) => (
        <MergeRowView key={entry.taskName} entry={entry} dashFrame={dashFrame} fps={fps} />
      ))}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────

export function DashboardView({
  dashFrame,
  fps,
}: {
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  const entrance = spring({
    frame: dashFrame,
    fps,
    config: SPRING_LAYOUT,
  });

  const state: DashboardSnapshot = getDashboardState(dashFrame, fps);

  return (
    <div style={{ opacity: entrance, marginTop: 8, fontSize: 12, lineHeight: 1.5, width: "100%", overflow: "hidden" }}>
      <HeaderBar clockTime={state.clockTime} />
      <HRule />
      <AgentsPanel agents={state.agents} dashFrame={dashFrame} />
      <HRule />
      <div style={{ display: "flex", width: "100%" }}>
        <MailPanel mail={state.mail} dashFrame={dashFrame} fps={fps} />
        <MergeQueuePanel merges={state.merges} dashFrame={dashFrame} fps={fps} />
      </div>
    </div>
  );
}
